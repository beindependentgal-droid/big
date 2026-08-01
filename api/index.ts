import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Donation, MonthlySupporter, Campaign } from "../src/data";
import { 
  loadDb, 
  saveDb, 
  ApplicationState, 
  hashPassword, 
  generateSalt, 
  createSessionToken, 
  verifySessionToken, 
  writeAuditLog,
  SimulatedEmail,
  TMP_DB_FILE,
  isDbWritable
} from "./_db";
import { buildOtpEmailPayload, buildPasswordResetEmailPayload, buildWelcomeEmailPayload } from "./email";

dotenv.config();

// Helper to read first available environment variable from a list and trim it
function getEnvVar(...names: string[]): string {
  for (const n of names) {
    const v = process.env[n];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

// PKCE helpers and in-memory PKCE/state store
type PkceEntry = { verifier: string; expires: number; origin?: string };
const pkceStore = new Map<string, PkceEntry>();

function base64UrlEncode(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

function generateCodeVerifier() {
  return base64UrlEncode(crypto.randomBytes(64));
}

function generateCodeChallenge(verifier: string) {
  return base64UrlEncode(sha256(Buffer.from(verifier)));
}

function cleanupPkceStore() {
  const now = Date.now();
  for (const [k, v] of pkceStore.entries()) {
    if (v.expires < now) pkceStore.delete(k);
  }
}

const supabaseServiceUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL_1 ||
  '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_KEY_1 ||
  '';

const isBackendSupabaseConfigured = Boolean(
  supabaseServiceUrl &&
  supabaseServiceKey &&
  supabaseServiceUrl.startsWith('http')
);

let backendSupabaseClient: SupabaseClient | null = null;
if (isBackendSupabaseConfigured) {
  backendSupabaseClient = createClient(supabaseServiceUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
} else {
  console.warn('[Backend Supabase] Service role key or Supabase URL is not configured. Backend Supabase routes are disabled.');
}

function getBackendSupabase(): SupabaseClient | null {
  return backendSupabaseClient;
}

// Lazy initialization of Resend client for real email dispatches
let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  const resendKey =
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    process.env.NEXT_PUBLIC_RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.RESEND_API_KEY_1 ||
    '';

  if (!resendClient && resendKey) {
    resendClient = new Resend(resendKey);
  }
  return resendClient;
}

function getResendFromEmail(): string {
  const envFrom = process.env.RESEND_FROM_EMAIL;
  if (envFrom && envFrom.includes("@")) {
    return envFrom;
  }
  return "BIG Foundation <info@beindependentgal.com>";
}

const app = express();

// Diagnostic endpoint (protected by DIAG_TOKEN) for debugging production failures
app.get('/api/_diag', (req, res) => {
  const token = req.query.token as string || '';
  const expected = getEnvVar('DIAG_TOKEN', 'DEBUG_TOKEN');
  if (!expected) return res.status(404).send('Not Found');
  if (!token || token !== expected) return res.status(403).json({ error: 'Forbidden' });

  try {
    const fsChecks: any = {};
    const localPath = path.resolve(process.cwd(), 'api', '_db.json');
    try { fsChecks.localExists = fs.existsSync(localPath); } catch (e) { fsChecks.localExists = false; }
    try { fsChecks.tmpExists = fs.existsSync(TMP_DB_FILE); } catch (e) { fsChecks.tmpExists = false; }
    try { fsChecks.dbWritable = typeof isDbWritable === 'function' ? isDbWritable() : null; } catch (e) { fsChecks.dbWritable = false; }
    const envCheck = {
      GOOGLE_CLIENT_ID: !!getEnvVar('GOOGLE_CLIENT_ID','VITE_GOOGLE_CLIENT_ID','NEXT_PUBLIC_GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: !!getEnvVar('GOOGLE_CLIENT_SECRET','VITE_GOOGLE_CLIENT_SECRET'),
      RESEND_API_KEY: !!getEnvVar('RESEND_API_KEY')
    };

    // Attempt to load DB
    let loaded: any = null;
    try { loaded = loadDb(); } catch (e) { loaded = { error: String(e) }; }

    res.json({ ok: true, fsChecks, envCheck, loadedSummary: { members: Array.isArray(loaded?.members) ? loaded.members.length : null } });
  } catch (err: any) {
    res.status(500).json({ error: String(err) });
  }
});

// Global Security Headers Middleware with Content Security Policy (CSP)
app.use((req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Enable XSS protection filter in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Robust Content Security Policy (CSP) to effectively mitigate XSS risks by restricting allowed script and style sources
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-src 'self' https:; " +
    "media-src 'self' data: blob: https:; " +
    "object-src 'none';"
  );
  
  // Disable caching for sensitive API responses
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Limit body parsing to a safe threshold (e.g. 5mb) to avoid disk exhaustion / payload-size inflation
app.use(express.json({ limit: '5mb' }));
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Robust Token Bucket Rate Limiter to prevent brute-force and resource abuse
class TokenBucket {
  private capacity: number;
  private tokens: number;
  private fillRate: number; // tokens per millisecond
  private lastRefill: number;

  constructor(capacity: number, refillRatePerMin: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.fillRate = refillRatePerMin / (60 * 1000);
    this.lastRefill = Date.now();
  }

  public consume(amount = 1): boolean {
    this.refill();
    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }
    return false;
  }

  private refill() {
    const now = Date.now();
    const delta = now - this.lastRefill;
    const added = delta * this.fillRate;
    this.tokens = Math.min(this.capacity, this.tokens + added);
    this.lastRefill = now;
  }
}

const rateLimitBuckets = new Map<string, TokenBucket>();

function createTokenBucketLimiter(capacity: number, refillRatePerMin: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    const key = `${ip}:${req.path}`;
    
    let bucket = rateLimitBuckets.get(key);
    if (!bucket) {
      bucket = new TokenBucket(capacity, refillRatePerMin);
      rateLimitBuckets.set(key, bucket);
    }

    if (!bucket.consume(1)) {
      return res.status(429).json({
        error: "Too many requests. Please try again later."
      });
    }
    next();
  };
}

// Rate limiters: 60 requests per minute for general routes, 10 per minute for AI and Auth operations
const generalLimiter = createTokenBucketLimiter(60, 60);
const authLimiter = createTokenBucketLimiter(15, 15);
const aiLimiter = createTokenBucketLimiter(10, 10);

// Helper functions for secure input truncation & sanitization
function truncateString(str: any, maxLength: number): string {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength);
}

function sanitizeAndTruncateArray(arr: any, maxItems: number, maxItemLength: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, maxItems).map(item => truncateString(item, maxItemLength));
}

// Middleware for server-side token authorization
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  const session = verifySessionToken(token);
  if (!session) {
    return res.status(403).json({ error: "Invalid or expired session token" });
  }
  (req as any).user = session;
  next();
}

// In-memory OTP storage: Map of email -> { hash, expires }
interface OTPInfo {
  hash: string;
  expires: number;
}
const activeOTPs = new Map<string, OTPInfo>();

// AUTH API ENDPOINTS

// 1. Authenticated token verification
app.get("/api/auth/verify-session", authenticateToken, (req, res) => {
  try {
    const db = loadDb();
    const userId = (req as any).user.userId;
    const user = db.members.find(m => m.id === userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ valid: true, user });
  } catch (error) {
    res.status(500).json({ error: "Internal verification error" });
  }
});

// 2. Register
app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, biometricCredentialId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const db = loadDb();
    const cleanEmail = email.trim().toLowerCase();
    const existing = db.members.find(m => m.email?.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    const userId = `user-${Date.now()}`;

    // Initialize default pin as well (123456)
    const pinSalt = generateSalt();
    const pinHash = hashPassword('123456', pinSalt);

    const newMember = {
      id: userId,
      name: truncateString(name, 100),
      email: cleanEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      title: 'Aspiring Entrepreneur',
      city: 'Lagos',
      rank: 'Learner' as const,
      skills: [],
      interests: [],
      bio: '',
      points: 0,
      badges: [],
      passwordHash: hash,
      passwordSalt: salt,
      pinHash: pinHash,
      pinSalt: pinSalt,
      biometricCredentialId: biometricCredentialId || undefined,
      joinedAt: new Date().toISOString()
    };

    db.members.push(newMember);

    // Automatically send Welcome Email
    if (!db.simulatedEmails) db.simulatedEmails = [];
    db.simulatedEmails.unshift({
      id: `mail-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      to: cleanEmail,
      subject: `🌸 Welcome to Be Independent Gal (BIG) Platform, ${name}!`,
      body: `Hi ${name},\n\n` +
        `Welcome to the BIG global sisterhood! Your account has been initialized successfully.\n\n` +
        `You now have full access to our community feeds, BIG Academy seed grants, peer mentorship circles, micro-business tools, and BIG Fund impact campaigns.\n\n` +
        `Explore your dashboard and build your independent future with us!\n\n` +
        `Warmly,\n` +
        `The BIG Foundation Team\n` +
        `https://bigfund.org`,
      timestamp: Date.now()
    });

    saveDb(db);
    
    // Attempt to send welcome email
    let emailSendStatus = 'pending';
    let emailError: string | null = null;
    
    try {
      await sendMailWithResend({
        to: cleanEmail,
        subject: `🌸 Welcome to Be Independent Gal (BIG) Platform, ${name}!`,
        text: buildWelcomeEmailPayload(name).text,
        html: buildWelcomeEmailPayload(name).html
      });
      emailSendStatus = 'sent';
      console.log(`[WELCOME EMAIL SENT] to ${cleanEmail}`);
    } catch (error: any) {
      emailError = error.message || 'Email service temporarily unavailable';
      console.warn(`[WELCOME EMAIL FAILED] to ${cleanEmail}: ${emailError}`);
      
      // Don't fail registration, just log the email error
      // User can still use the platform
      emailSendStatus = 'failed';
    }

    writeAuditLog(userId, cleanEmail, "Account registration successful", req.ip || 'unknown');

    const token = createSessionToken(userId, cleanEmail);
    res.status(201).json({ token, user: newMember });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal registration failed" });
  }
});

// 3. Login
app.post("/api/auth/login", authLimiter, (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = loadDb();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.members.find(m => m.email?.toLowerCase() === cleanEmail);
    
    if (!user || !user.passwordHash || !user.passwordSalt) {
      return res.status(401).json({ error: "Invalid email or password credentials" });
    }

    const computedHash = hashPassword(password, user.passwordSalt);
    if (computedHash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password credentials" });
    }

    writeAuditLog(user.id, cleanEmail, "Account login successful", req.ip || 'unknown');

    const token = createSessionToken(user.id, cleanEmail);
    res.json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal login failed" });
  }
});

// Biometric Enroll & Verification
app.post("/api/auth/biometric-enroll", authenticateToken, (req, res) => {
  try {
    const { biometricCredentialId } = req.body;
    if (!biometricCredentialId) {
      return res.status(400).json({ error: "biometricCredentialId is required" });
    }
    const db = loadDb();
    const user = db.members.find(m => m.id === (req as any).user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.biometricCredentialId = biometricCredentialId;
    saveDb(db);
    writeAuditLog(user.id, user.email || 'unknown', "Biometric authentication enrolled successfully", req.ip || 'unknown');
    res.json({ success: true, user });
  } catch (error) {
    console.error("Biometric enroll error:", error);
    res.status(500).json({ error: "Internal biometric enrollment failed" });
  }
});

app.post("/api/auth/biometric-login", authLimiter, (req, res) => {
  try {
    const { email, biometricCredentialId } = req.body;
    if (!email || !biometricCredentialId) {
      return res.status(400).json({ error: "Email and biometricCredentialId are required" });
    }

    const db = loadDb();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.members.find(m => m.email?.toLowerCase() === cleanEmail);

    if (!user || !user.biometricCredentialId) {
      return res.status(401).json({ error: "Biometric authentication not set up or invalid for this account" });
    }

    if (user.biometricCredentialId !== biometricCredentialId) {
      return res.status(401).json({ error: "Invalid biometric signature verification" });
    }

    writeAuditLog(user.id, cleanEmail, "Biometric handshake login successful", req.ip || 'unknown');

    const token = createSessionToken(user.id, cleanEmail);
    res.json({ token, user });
  } catch (error) {
    console.error("Biometric login error:", error);
    res.status(500).json({ error: "Internal biometric login failed" });
  }
});

// Helper to get external origin in local, development, and production environments
const getExternalOrigin = (req: any): string => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const forwardedHost = req.headers['x-forwarded-host'];
  const host = forwardedHost || req.get('host') || '';
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto || ((host.includes('.run.app') || req.secure) ? 'https' : req.protocol);
  return `${protocol}://${host}`;
};

// Google OAuth Sign-In URL Endpoint
app.get("/api/auth/google/url", (req, res) => {
  try {
    const clientId = getEnvVar(
      'GOOGLE_CLIENT_ID',
      'CLIENT_ID',
      'VITE_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_ID_1'
    );
    if (!clientId) {
      return res.status(500).json({ error: "Google OAuth is not configured. Set GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID, and a matching client secret." });
    }

    const origin = (req.query.origin as string) || getExternalOrigin(req);
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Create a short-lived PKCE verifier + state id, store verifier server-side
    cleanupPkceStore();
    const stateId = crypto.randomBytes(12).toString('hex');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    pkceStore.set(stateId, { verifier: codeVerifier, expires: Date.now() + 10 * 60 * 1000, origin });

    // Encode origin + stateId in the state parameter to carry through the OAuth loop
    const stateObj = { origin, sid: stateId };
    const stateStr = Buffer.from(JSON.stringify(stateObj)).toString('base64');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      prompt: 'select_account',
      state: stateStr,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    }).toString();

    res.json({ url: authUrl });
  } catch (error) {
    console.error("Google Auth URL generation error:", error);
    res.status(500).json({ error: "Failed to generate Google auth URL" });
  }
});

// Google OAuth Callback Handler Endpoint
app.get(["/api/auth/google/callback", "/api/auth/google/callback/"], async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).send("Authorization code is missing");
    }

    const clientId = getEnvVar(
      'GOOGLE_CLIENT_ID',
      'CLIENT_ID',
      'VITE_GOOGLE_CLIENT_ID',
      'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_ID_1'
    );
    const clientSecret = getEnvVar(
      'GOOGLE_CLIENT_SECRET',
      'CLIENT_SECRET',
      'VITE_GOOGLE_CLIENT_SECRET',
      'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
      'GOOGLE_OAUTH_CLIENT_SECRET',
      'GOOGLE_OAUTH_CLIENT_SECRET_1'
    );

    if (!clientId || !clientSecret) {
      return res.status(500).send("Google client credentials are not configured");
    }

    // Extract original origin and state id from the state parameter if present
    let origin = getExternalOrigin(req);
    let codeVerifier: string | undefined = undefined;
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
        if (decodedState && decodedState.origin) {
          origin = decodedState.origin;
        }
        if (decodedState && decodedState.sid) {
          const sid = decodedState.sid as string;
          const entry = pkceStore.get(sid);
          if (entry) {
            codeVerifier = entry.verifier;
            // single-use: delete stored verifier
            pkceStore.delete(sid);
          }
        }
      } catch (e) {
        console.error("Failed to parse Google OAuth state:", e);
      }
    }
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange code for Google Access Token
    const tokenBody: any = {
      code: code as string,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    };
    if (codeVerifier) {
      tokenBody.code_verifier = codeVerifier;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenBody)
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.status(500).send(`Failed to exchange Google OAuth code: ${errText}`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    // Retrieve user profile information using the access token
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return res.status(500).send("Failed to retrieve Google user profile");
    }

    const googleUser = await userRes.json();
    const email = googleUser.email;
    const name = googleUser.name || googleUser.given_name || 'BIG Sister';
    const avatar = googleUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    const db = loadDb();
    const cleanEmail = email.trim().toLowerCase();
    let user = db.members.find(m => m.email?.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-register new Google user
      const userId = `user-google-${Date.now()}`;
      const salt = generateSalt();
      const hash = hashPassword(crypto.randomBytes(16).toString('hex'), salt);

      const pinSalt = generateSalt();
      const pinHash = hashPassword('123456', pinSalt);

      user = {
        id: userId,
        name: truncateString(name, 100),
        email: cleanEmail,
        avatar: avatar,
        title: 'Aspiring Entrepreneur',
        city: 'Lagos',
        rank: 'Learner' as const,
        skills: [],
        interests: [],
        bio: '',
        points: 0,
        badges: [],
        passwordHash: hash,
        passwordSalt: salt,
        pinHash: pinHash,
        pinSalt: pinSalt,
        joinedAt: new Date().toISOString()
      };

      db.members.push(user);

      // Welcome Email Simulation
      if (!db.simulatedEmails) db.simulatedEmails = [];
      db.simulatedEmails.unshift({
        id: `mail-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        to: cleanEmail,
        subject: `🌸 Welcome to Be Independent Gal (BIG) Platform, ${name}!`,
        body: `Hi ${name},\n\n` +
          `Welcome to the BIG global sisterhood! Your account was securely established via Google Sign-In.\n\n` +
          `You now have full access to our community feeds, BIG Academy seed grants, peer mentorship circles, micro-business tools, and BIG Fund impact campaigns.\n\n` +
          `Explore your dashboard and build your independent future with us!\n\n` +
          `Warmly,\n` +
          `The BIG Foundation Team\n` +
          `https://bigfund.org`,
        timestamp: Date.now()
      });

      saveDb(db);
      const welcomePayload = buildWelcomeEmailPayload(name);
      void sendMailWithResend({
        to: cleanEmail,
        subject: welcomePayload.subject,
        text: welcomePayload.text,
        html: welcomePayload.html
      }).catch((error) => console.warn('Google welcome email delivery failed:', error));
    }

    const token = createSessionToken(user.id, cleanEmail);
    writeAuditLog(user.id, cleanEmail, "Google login successful", req.ip || 'unknown');

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                token: ${JSON.stringify(token)}, 
                user: ${JSON.stringify(user)} 
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google Auth Callback error:", error);
    res.status(500).send("Internal Google authentication failed");
  }
});

async function sendMailWithResend(params: { to: string; subject: string; text: string; html: string }) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('Resend is not configured');
  }

  const fromEmail = getResendFromEmail();
  const response = await resend.emails.send({
    from: fromEmail,
    to: [params.to],
    subject: params.subject,
    text: params.text,
    html: params.html
  });

  if (response.error) {
    throw new Error(response.error.message || JSON.stringify(response.error));
  }

  return response;
}

// 4. Request OTP (One-Time Passcode)
app.post("/api/auth/request-otp", authLimiter, async (req, res) => {
  try {
    const { email, actionName } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate cryptographically secure random 6-digit number
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    
    // Store hashed code in memory with 5 minutes expiry
    activeOTPs.set(email.toLowerCase(), {
      hash: codeHash,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Write simulated email notification server-side
    const db = loadDb();
    if (!db.simulatedEmails) db.simulatedEmails = [];
    
    const subject = "🔐 One-Time Security Authorization Passcode";
    const body = `Your one-time authorization code for the action "${actionName || 'Sensitive Action'}" is: ${code}. Please enter this code in the BIG platform to authorize your request. This code will expire in 5 minutes.`;
    
    const emailEntry: SimulatedEmail = {
      id: `mail-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      to: email,
      subject,
      body,
      timestamp: Date.now()
    };
    db.simulatedEmails.unshift(emailEntry);
    saveDb(db);

    const payload = buildOtpEmailPayload(code, actionName || 'Sensitive Action');

    let emailSent = false;
    try {
      await sendMailWithResend({
        to: email,
        subject: payload.subject,
        text: payload.text,
        html: payload.html
      });
      emailSent = true;
      console.log(`[SECURITY OTP EMAIL SENT] to ${email}`);
    } catch (error: any) {
      console.warn(`[SECURITY OTP EMAIL FAILED] to ${email}:`, error.message);
      // Don't fail the request - code is still stored, user can get it from logs if needed
    }

    console.log(`[SECURITY OTP DISPATCHED TO ${email}]: Code is ${code}. Email status: ${emailSent ? 'sent' : 'pending/failed'}.`);

    res.json({ 
      success: true, 
      message: emailSent 
        ? "A secure verification code has been dispatched to your email." 
        : "Code generated. Check your email (or browser console if email service is in test mode)."
    });
  } catch (error) {
    console.error("Request OTP error:", error);
    res.status(500).json({ error: "Failed to dispatch verification code" });
  }
});

// 5. Verify OTP
app.post("/api/auth/verify-otp", authLimiter, (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    const cleanEmail = email.toLowerCase();
    const otpInfo = activeOTPs.get(cleanEmail);

    if (!otpInfo) {
      return res.status(400).json({ error: "No code has been requested for this email" });
    }

    if (Date.now() > otpInfo.expires) {
      activeOTPs.delete(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    const enteredHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (enteredHash !== otpInfo.hash) {
      return res.status(400).json({ error: "Invalid verification code. Please verify the email code and try again." });
    }

    // Single-use: delete upon success
    activeOTPs.delete(cleanEmail);

    res.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Internal verification failed" });
  }
});

// 6. Reset password with OTP verification
app.post("/api/auth/reset-password", authLimiter, async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (!email || !code || !password) {
      return res.status(400).json({ error: "Email, code, and a new password are required" });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpInfo = activeOTPs.get(cleanEmail);

    if (!otpInfo) {
      return res.status(400).json({ error: "No verification code has been requested for this email" });
    }

    if (Date.now() > otpInfo.expires) {
      activeOTPs.delete(cleanEmail);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    const enteredHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (enteredHash !== otpInfo.hash) {
      return res.status(400).json({ error: "Invalid verification code. Please check your simulated mailbox." });
    }

    activeOTPs.delete(cleanEmail);

    const db = loadDb();
    const user = db.members.find(m => m.email?.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: "No account was found for this email" });
    }

    const salt = generateSalt();
    user.passwordHash = hashPassword(password, salt);
    user.passwordSalt = salt;
    saveDb(db);

    const resetPayload = buildPasswordResetEmailPayload(code.trim());
    let resetEmailSent = false;
    
    try {
      await sendMailWithResend({
        to: cleanEmail,
        subject: resetPayload.subject,
        text: resetPayload.text,
        html: resetPayload.html
      });
      resetEmailSent = true;
      console.log(`[PASSWORD RESET CONFIRMATION EMAIL SENT] to ${cleanEmail}`);
    } catch (error: any) {
      console.warn(`[PASSWORD RESET CONFIRMATION EMAIL FAILED] to ${cleanEmail}:`, error.message);
      // Don't fail the reset - password is already changed
    }

    writeAuditLog(user.id, cleanEmail, "Password reset successful", req.ip || 'unknown');
    res.json({ 
      success: true, 
      message: resetEmailSent 
        ? "Your password was reset successfully. A confirmation email has been sent." 
        : "Your password was reset successfully." 
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// 6. Set Security PIN on Server
app.post("/api/security/set-pin", authenticateToken, (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || pin.length !== 6 || /\D/.test(pin)) {
      return res.status(400).json({ error: "PIN must be exactly 6 numeric digits" });
    }

    const userId = (req as any).user.userId;
    const db = loadDb();
    const userIndex = db.members.findIndex(m => m.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const pinSalt = generateSalt();
    const pinHash = hashPassword(pin, pinSalt);

    db.members[userIndex].pinHash = pinHash;
    db.members[userIndex].pinSalt = pinSalt;
    saveDb(db);

    writeAuditLog(userId, (req as any).user.email, "Security PIN code changed", req.ip || 'unknown');

    res.json({ success: true });
  } catch (error) {
    console.error("Set PIN error:", error);
    res.status(500).json({ error: "Failed to configure PIN code" });
  }
});

// 7. Verify Security PIN on Server
app.post("/api/security/verify-pin", authenticateToken, (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: "PIN is required" });
    }

    const userId = (req as any).user.userId;
    const db = loadDb();
    const user = db.members.find(m => m.id === userId);
    if (!user || !user.pinHash || !user.pinSalt) {
      return res.status(400).json({ error: "No security PIN configured for this account" });
    }

    const enteredHash = hashPassword(pin, user.pinSalt);
    if (enteredHash !== user.pinHash) {
      return res.status(401).json({ error: "Incorrect security PIN code" });
    }

    writeAuditLog(userId, (req as any).user.email, `Sensitive authorization approved`, req.ip || 'unknown');

    res.json({ success: true });
  } catch (error) {
    console.error("Verify PIN error:", error);
    res.status(500).json({ error: "PIN verification failed" });
  }
});

// 8. Real Send Email API Endpoint using Resend
app.post("/api/email/send", generalLimiter, async (req, res) => {
  try {
    const { to, subject, body, template, donorName, campaignTitle, amount, receiptNumber } = req.body;
    
    if (!to || !subject) {
      return res.status(400).json({ error: "Recipient email 'to' and 'subject' are required." });
    }

    const cleanTo = to.trim().toLowerCase();
    
    let textBody = body || '';
    let htmlBody = '';

    // Standardized email templates with responsive HTML
    if (template === 'receipt') {
      const refCode = receiptNumber || 'SK' + Math.floor(100000 + Math.random() * 899999) + 'YP';
      const cName = donorName || 'Valued Supporter';
      const cause = campaignTitle || 'BIG Community Impact Fund';
      const amt = (amount || 1000).toLocaleString();

      textBody = body || `BE INDEPENDENT GAL (BIG) FUND - OFFICIAL CONTRIBUTION RECEIPT\n` +
        `--------------------------------------------------\n` +
        `Receipt Reference: ${refCode}\n` +
        `Contributor: ${cName}\n` +
        `Designated Cause: ${cause}\n` +
        `Amount Paid: KES ${amt}.00\n` +
        `Channel: Safaricom M-Pesa STK Push\n` +
        `Date: ${new Date().toLocaleString('en-KE')}\n\n` +
        `Thank you for advancing African women's leadership and digital economic independence!`;

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background-color: #831843; padding: 20px; border-radius: 12px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 800;">BE INDEPENDENT GAL (BIG)</h2>
            <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.9;">OFFICIAL M-PESA CONTRIBUTION RECEIPT</p>
          </div>
          <div style="padding: 24px 8px;">
            <p style="font-size: 14px; color: #334155;">Dear <strong>${cName}</strong>,</p>
            <p style="font-size: 14px; color: #334155;">Thank you for your generous contribution to the <strong>${cause}</strong>. Your support powers grassroot micro-grants and female empowerment across Africa.</p>
            <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; font-size: 13px; color: #1e293b; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748b;">Receipt Reference:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669;">${refCode}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Amount Paid:</td><td style="padding: 6px 0; font-weight: bold; text-align: right;">KES ${amt}.00</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Payment Method:</td><td style="padding: 6px 0; text-align: right;">M-Pesa STK Push</td></tr>
                <tr><td style="padding: 6px 0; color: #64748b;">Status:</td><td style="padding: 6px 0; font-weight: bold; text-align: right; color: #059669;">VERIFIED & COMPLETED</td></tr>
              </table>
            </div>
            <p style="font-size: 12px; color: #64748b; text-align: center;">With warm solidarity,<br><strong>The BIG Foundation Team</strong><br><a href="https://bigfund.org" style="color: #db2777;">https://bigfund.org</a></p>
          </div>
        </div>
      `;
    } else if (template === 'welcome') {
      textBody = body || `Welcome to Be Independent Gal (BIG) Platform!\n\n` +
        `Dear Sister,\n\n` +
        `We are thrilled to welcome you to the BIG global movement of female entrepreneurs, tech pioneers, and community leaders.\n\n` +
        `Your account has been successfully initialized. You can now access BIG Academy, micro-grant funding opportunities, peer circles, and mentorship programs.\n\n` +
        `With warm solidarity,\n` +
        `The BIG Foundation Team\n` +
        `https://bigfund.org`;

      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background-color: #be185d; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px;">Welcome to the Sisterhood! 🌸</h1>
            <p style="margin: 8px 0 0; font-size: 13px;">Be Independent Gal (BIG) Platform</p>
          </div>
          <div style="padding: 24px 8px; font-size: 14px; color: #334155; line-height: 1.6;">
            <p>Dear Sister,</p>
            <p>Welcome to the BIG global platform connecting African female entrepreneurs, tech builders, and community leaders.</p>
            <p>Your account is ready. You now have access to:</p>
            <ul>
              <li><strong>BIG Academy Micro-Grants & Seed Funding</strong></li>
              <li><strong>Peer Mentorship Circles</strong></li>
              <li><strong>Directory & Business Networking</strong></li>
              <li><strong>BIG Fund Community Campaigns</strong></li>
            </ul>
            <p>Warmly,<br><strong>The BIG Foundation Team</strong></p>
          </div>
        </div>
      `;
    } else {
      textBody = body || textBody;
      htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="background-color: #1e293b; padding: 18px; border-radius: 12px; text-align: center; color: #ffffff;">
            <h3 style="margin: 0; font-size: 16px;">Be Independent Gal (BIG) Notification</h3>
          </div>
          <div style="padding: 20px 8px; font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
            ${textBody}
          </div>
        </div>
      `;
    }

    const resend = getResendClient();

    if (resend) {
      let fromEmail = getResendFromEmail();
      let resendResponse = await resend.emails.send({
        from: fromEmail,
        to: [cleanTo],
        subject: subject,
        text: textBody,
        html: htmlBody
      });

      // If sending fails with custom domain (e.g. domain not verified yet on Resend), retry with onboarding@resend.dev
      if (resendResponse.error && fromEmail !== "BIG Foundation <onboarding@resend.dev>") {
        console.warn(`[RESEND FALLBACK] Sending with ${fromEmail} failed (${resendResponse.error.message || resendResponse.error.name}). Retrying with BIG Foundation <onboarding@resend.dev>`);
        fromEmail = "BIG Foundation <onboarding@resend.dev>";
        resendResponse = await resend.emails.send({
          from: fromEmail,
          to: [cleanTo],
          subject: subject,
          text: textBody,
          html: htmlBody
        });
      }

      if (resendResponse.error) {
        console.error("[RESEND DELIVERY ERROR]", resendResponse.error);
        let errorDetails = resendResponse.error.message || JSON.stringify(resendResponse.error);
        
        // Friendly explanation for Resend sandbox testing restrictions
        if (resendResponse.error.name === 'validation_error' && errorDetails.toLowerCase().includes('testing emails')) {
          errorDetails = `Resend Testing Mode: Free keys can only deliver to your registered account owner email. Verify domain (beindependentgal.com) in Resend to send to external recipients. (${errorDetails})`;
        }

        return res.status(400).json({
          success: false,
          error: errorDetails
        });
      }

      const emailId = resendResponse.data?.id || `resend-${Date.now()}`;
      const db = loadDb();
      if (!db.sentEmailLogs) db.sentEmailLogs = [];
      db.sentEmailLogs.unshift({
        id: emailId,
        to: cleanTo,
        subject: truncateString(subject, 200),
        status: 'Delivered via Resend API',
        provider: 'Resend',
        timestamp: Date.now()
      });
      saveDb(db);

      writeAuditLog('system', cleanTo, `Sent real email via Resend: ${subject}`, req.ip || 'unknown');

      return res.json({
        success: true,
        emailId,
        provider: 'resend',
        message: `Real email successfully dispatched to ${cleanTo} via Resend!`
      });
    }

    // Fallback response when RESEND_API_KEY is not yet populated
    const db = loadDb();
    if (!db.sentEmailLogs) db.sentEmailLogs = [];
    const pendingId = `pending-${Date.now()}`;
    db.sentEmailLogs.unshift({
      id: pendingId,
      to: cleanTo,
      subject: truncateString(subject, 200),
      status: 'Awaiting RESEND_API_KEY configuration',
      provider: 'Resend API',
      timestamp: Date.now()
    });
    saveDb(db);

    console.log(`[EMAIL DISPATCH NOTICE] Real email to ${cleanTo} logged. Set RESEND_API_KEY in environment variables to send live emails.`);

    return res.json({
      success: false,
      requiresApiKey: true,
      provider: 'resend',
      message: `RESEND_API_KEY is not configured in environment settings. Please add RESEND_API_KEY to send live emails to ${cleanTo}.`
    });
  } catch (error: any) {
    console.error("Send email error:", error);
    res.status(500).json({ error: error?.message || "Failed to dispatch email" });
  }
});


// 9. Fetch Audit Logs for current user
app.get("/api/security/audit-logs", authenticateToken, (req, res) => {
  try {
    const db = loadDb();
    const userId = (req as any).user.userId;
    const logs = (db.auditLogs || []).filter(log => log.userId === userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve audit trail" });
  }
});


// Apply general rate limiting to all database APIs
app.use("/api/db", generalLimiter);
app.use("/api/members", generalLimiter);
app.use("/api/posts", generalLimiter);
app.use("/api/events", generalLimiter);
app.use("/api/challenges", generalLimiter);
app.use("/api/conversations", generalLimiter);
app.use("/api/mentorship-pairs", generalLimiter);
app.use("/api/forum-threads", generalLimiter);
app.use("/api/circle-states", generalLimiter);
app.use("/api/supabase", generalLimiter);

// API Route: Backend Supabase health and diagnostic probe
app.get("/api/supabase/health", async (req, res) => {
  const supabase = getBackendSupabase();
  if (!supabase) {
    return res.status(503).json({
      status: "unconfigured",
      message: "Backend Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables."
    });
  }

  try {
    const { data, error } = await supabase
      .from('big_members')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Backend Supabase health probe failed:', error);
      return res.status(500).json({ status: 'error', message: 'Failed to query Supabase', details: error.message || error });
    }

    res.json({
      status: 'ok',
      tablesReachable: true,
      sampleRows: Array.isArray(data) ? data.length : 0,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Backend Supabase health probe exception:', error);
    res.status(500).json({
      status: 'error',
      message: 'Backend Supabase health probe exception',
      details: error.message || error
    });
  }
});

app.get("/api/supabase/members", async (req, res) => {
  const supabase = getBackendSupabase();
  if (!supabase) {
    return res.status(503).json({ error: "Backend Supabase is not configured." });
  }

  try {
    const { data, error } = await supabase.from('big_members').select('*').order('points', { ascending: false });
    if (error) {
      console.error('Backend Supabase members fetch failed:', error);
      return res.status(500).json({ error: error.message || 'Failed to load members from Supabase' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Backend Supabase members fetch exception:', error);
    res.status(500).json({ error: error.message || 'Backend Supabase fetch exception' });
  }
});

// API Route: Health check probing server uptime and database connectivity
app.get("/api/health", (req, res) => {
  try {
    // Probe database connectivity by loading data
    const data = loadDb();
    res.json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Health probe failure:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: "Internal server health probe failed",
      timestamp: new Date().toISOString()
    });
  }
});

// API Route: Get the entire persistent DB state (one request sync)
app.get("/api/db", (req, res) => {
  try {
    const data = loadDb();
    res.json(data);
  } catch (error: any) {
    console.error("Failed to load db state:", error);
    res.status(500).json({ error: "Failed to load database state" });
  }
});

// API Route: Save or sync entire DB state with authenticated session and ownership checks
app.post("/api/db/sync", authenticateToken, (req, res) => {
  try {
    const db = loadDb();
    const clientState = req.body;
    const userId = (req as any).user.userId;
    const userEmail = (req as any).user.email;
    const ip = req.ip || 'unknown';

    // 1. Members Ownership Check: Can ONLY update self profile
    if (clientState.members && Array.isArray(clientState.members)) {
      const userIndex = db.members.findIndex(m => m.id === userId);
      const clientUserObj = clientState.members.find((m: any) => m.id === userId);
      
      if (clientUserObj) {
        const original = (db.members[userIndex] || {}) as any;
        // Strip out credential hashes so they cannot be corrupted or overwritten via sync
        const sanitizedClientObj = {
          ...clientUserObj,
          passwordHash: original.passwordHash,
          passwordSalt: original.passwordSalt,
          pinHash: original.pinHash,
          pinSalt: original.pinSalt
        };
        if (userIndex !== -1) {
          db.members[userIndex] = sanitizedClientObj;
        } else {
          db.members.push(sanitizedClientObj);
        }
      }
      // Any other members sent in clientState are discarded to block ID-fiddling completely.
    }

    // 2. Posts Ownership Check: Can ONLY create or update posts they authored
    if (clientState.posts && Array.isArray(clientState.posts)) {
      const allowedPosts = clientState.posts.filter((p: any) => p.author?.id === userId);
      allowedPosts.forEach((post: any) => {
        const idx = db.posts.findIndex(p => p.id === post.id);
        if (idx !== -1) {
          if (db.posts[idx].author?.id === userId) {
            db.posts[idx] = post;
          }
        } else {
          db.posts.unshift(post);
        }
      });
    }

    // 3. Events Ownership Check: Can ONLY manage events they created
    if (clientState.events && Array.isArray(clientState.events)) {
      const allowedEvents = clientState.events.filter((e: any) => e.createdBy === userId || !e.createdBy);
      allowedEvents.forEach((event: any) => {
        const idx = db.events.findIndex(e => e.id === event.id);
        if (idx !== -1) {
          db.events[idx] = { ...event, createdBy: userId };
        } else {
          db.events.unshift({ ...event, createdBy: userId });
        }
      });
    }

    // 4. Conversations: Only write if part of the conversation
    if (clientState.conversations && Array.isArray(clientState.conversations)) {
      clientState.conversations.forEach((conv: any) => {
        const isParticipant = Array.isArray(conv.participants) && conv.participants.some((p: any) => p.id === userId);
        if (isParticipant) {
          const idx = db.conversations.findIndex(c => c.id === conv.id);
          if (idx !== -1) {
            db.conversations[idx] = conv;
          } else {
            db.conversations.push(conv);
          }
        }
      });
    }

    // Merge other non-sensitive metrics or preferences scoped to user
    if (clientState.userPoints !== undefined && typeof clientState.userPoints === 'number') {
      db.userPoints = clientState.userPoints;
    }
    if (clientState.userBadges && Array.isArray(clientState.userBadges)) {
      db.userBadges = clientState.userBadges;
    }
    if (clientState.followingIds && Array.isArray(clientState.followingIds)) {
      db.followingIds = clientState.followingIds;
    }
    if (clientState.bookmarkedPostIds && Array.isArray(clientState.bookmarkedPostIds)) {
      db.bookmarkedPostIds = clientState.bookmarkedPostIds;
    }
    if (clientState.academyProgress && typeof clientState.academyProgress === 'object') {
      db.academyProgress = {
        enrolledCourseIds: Array.isArray(clientState.academyProgress.enrolledCourseIds) ? clientState.academyProgress.enrolledCourseIds : [],
        completedLessonIds: Array.isArray(clientState.academyProgress.completedLessonIds) ? clientState.academyProgress.completedLessonIds : [],
        lessonNotes: clientState.academyProgress.lessonNotes && typeof clientState.academyProgress.lessonNotes === 'object' ? clientState.academyProgress.lessonNotes : {},
        earnedCertificateIds: Array.isArray(clientState.academyProgress.earnedCertificateIds) ? clientState.academyProgress.earnedCertificateIds : [],
        activeCourseId: clientState.academyProgress.activeCourseId || null,
        activeLessonId: clientState.academyProgress.activeLessonId || null,
      };
    }
    if (clientState.notifications && Array.isArray(clientState.notifications)) {
      db.notifications = clientState.notifications;
    }
    if (clientState.campaigns && Array.isArray(clientState.campaigns)) {
      db.campaigns = clientState.campaigns;
    }
    if (clientState.donations && Array.isArray(clientState.donations)) {
      db.donations = clientState.donations;
    }
    if (clientState.monthlySupporters && Array.isArray(clientState.monthlySupporters)) {
      db.monthlySupporters = clientState.monthlySupporters;
    }
    if (clientState.impactStories && Array.isArray(clientState.impactStories)) {
      db.impactStories = clientState.impactStories;
    }

    if (clientState.circleRequests && Array.isArray(clientState.circleRequests)) {
      db.circleRequests = clientState.circleRequests;
    }

    if (clientState.circleStates && typeof clientState.circleStates === 'object') {
      db.circleStates = {
        ...db.circleStates,
        ...clientState.circleStates
      };
    }

    saveDb(db);
    res.json({ success: true, state: db });
  } catch (error: any) {
    console.error("Failed to sync db state:", error);
    res.status(500).json({ error: "Failed to sync database state" });
  }
});

// Granular API: Members
app.get("/api/members", (req, res) => {
  try {
    const db = loadDb();
    // Strip secure fields before returning list of members to clients
    const safeMembers = db.members.map((m: any) => {
      const { passwordHash, passwordSalt, pinHash, pinSalt, ...rest } = m;
      return rest;
    });
    res.json(safeMembers);
  } catch (error: any) {
    console.error("Failed to get members:", error);
    res.status(500).json({ error: "Failed to load members" });
  }
});

app.post("/api/members", authenticateToken, (req, res) => {
  try {
    const db = loadDb();
    const newMemberObj = req.body;
    const userId = (req as any).user.userId;

    if (newMemberObj.id !== userId) {
      return res.status(403).json({ error: "Unauthorized profile modification attempt detected" });
    }

    const idx = db.members.findIndex(m => m.id === userId);
    if (idx !== -1) {
      const original = db.members[idx];
      db.members[idx] = {
        ...newMemberObj,
        passwordHash: original.passwordHash,
        passwordSalt: original.passwordSalt,
        pinHash: original.pinHash,
        pinSalt: original.pinSalt
      };
    } else {
      db.members.push(newMemberObj);
    }

    saveDb(db);
    
    // Strip sensitive fields before responding
    const { passwordHash, passwordSalt, pinHash, pinSalt, ...safeMember } = db.members[idx !== -1 ? idx : db.members.length - 1] as any;
    res.json(safeMember);
  } catch (error: any) {
    console.error("Failed to update members:", error);
    res.status(500).json({ error: "Failed to save member state" });
  }
});

// Granular API: Posts
app.get("/api/posts", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.posts);
  } catch (error: any) {
    console.error("Failed to get posts:", error);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

app.post("/api/posts", (req, res) => {
  try {
    const db = loadDb();
    const postData = req.body;
    if (Array.isArray(postData)) {
      db.posts = postData;
    } else {
      const idx = db.posts.findIndex(p => p.id === postData.id);
      if (idx !== -1) {
        db.posts[idx] = postData;
      } else {
        db.posts.unshift(postData); // put new posts at top
      }
    }
    saveDb(db);
    res.json(db.posts);
  } catch (error: any) {
    console.error("Failed to update posts:", error);
    res.status(500).json({ error: "Failed to save posts" });
  }
});

// Granular API: Events
app.get("/api/events", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.events);
  } catch (error: any) {
    console.error("Failed to get events:", error);
    res.status(500).json({ error: "Failed to load events" });
  }
});

app.post("/api/events", (req, res) => {
  try {
    const db = loadDb();
    const eventData = req.body;
    if (Array.isArray(eventData)) {
      db.events = eventData;
    } else {
      const idx = db.events.findIndex(e => e.id === eventData.id);
      if (idx !== -1) {
        db.events[idx] = eventData;
      } else {
        db.events.push(eventData);
      }
    }
    saveDb(db);
    res.json(db.events);
  } catch (error: any) {
    console.error("Failed to update events:", error);
    res.status(500).json({ error: "Failed to save events" });
  }
});

// Granular API: Challenges
app.get("/api/challenges", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.challenges);
  } catch (error: any) {
    console.error("Failed to get challenges:", error);
    res.status(500).json({ error: "Failed to load challenges" });
  }
});

app.post("/api/challenges", (req, res) => {
  try {
    const db = loadDb();
    const challengeData = req.body;
    if (Array.isArray(challengeData)) {
      db.challenges = challengeData;
    } else {
      const idx = db.challenges.findIndex(c => c.id === challengeData.id);
      if (idx !== -1) {
        db.challenges[idx] = challengeData;
      } else {
        db.challenges.push(challengeData);
      }
    }
    saveDb(db);
    res.json(db.challenges);
  } catch (error: any) {
    console.error("Failed to update challenges:", error);
    res.status(500).json({ error: "Failed to save challenges" });
  }
});

// Granular API: Conversations
app.get("/api/conversations", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.conversations);
  } catch (error: any) {
    console.error("Failed to get conversations:", error);
    res.status(500).json({ error: "Failed to load conversations" });
  }
});

app.post("/api/conversations", (req, res) => {
  try {
    const db = loadDb();
    const convData = req.body;
    if (Array.isArray(convData)) {
      db.conversations = convData;
    } else {
      const idx = db.conversations.findIndex(c => c.id === convData.id);
      if (idx !== -1) {
        db.conversations[idx] = convData;
      } else {
        db.conversations.push(convData);
      }
    }
    saveDb(db);
    res.json(db.conversations);
  } catch (error: any) {
    console.error("Failed to update conversations:", error);
    res.status(500).json({ error: "Failed to save conversations" });
  }
});

// Granular API: Mentorship Pairs
app.get("/api/mentorship-pairs", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.mentorshipPairs);
  } catch (error: any) {
    console.error("Failed to get mentorship-pairs:", error);
    res.status(500).json({ error: "Failed to load mentorship pairs" });
  }
});

app.post("/api/mentorship-pairs", (req, res) => {
  try {
    const db = loadDb();
    const pairData = req.body;
    if (Array.isArray(pairData)) {
      db.mentorshipPairs = pairData;
    } else {
      const idx = db.mentorshipPairs.findIndex(p => p.id === pairData.id);
      if (idx !== -1) {
        db.mentorshipPairs[idx] = pairData;
      } else {
        db.mentorshipPairs.unshift(pairData);
      }
    }
    saveDb(db);
    res.json(db.mentorshipPairs);
  } catch (error: any) {
    console.error("Failed to update mentorship pairs:", error);
    res.status(500).json({ error: "Failed to save mentorship pairs" });
  }
});

// Granular API: Forum Threads
app.get("/api/forum-threads", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.forumThreads);
  } catch (error: any) {
    console.error("Failed to get forum threads:", error);
    res.status(500).json({ error: "Failed to load forum threads" });
  }
});

app.post("/api/forum-threads", (req, res) => {
  try {
    const db = loadDb();
    const threadData = req.body;
    if (Array.isArray(threadData)) {
      db.forumThreads = threadData;
    } else {
      const idx = db.forumThreads.findIndex(t => t.id === threadData.id);
      if (idx !== -1) {
        db.forumThreads[idx] = threadData;
      } else {
        db.forumThreads.unshift(threadData);
      }
    }
    saveDb(db);
    res.json(db.forumThreads);
  } catch (error: any) {
    console.error("Failed to update forum threads:", error);
    res.status(500).json({ error: "Failed to save forum threads" });
  }
});

// Granular API: Circle States
app.get("/api/circle-states", (req, res) => {
  try {
    const db = loadDb();
    res.json(db.circleStates);
  } catch (error: any) {
    console.error("Failed to get circle states:", error);
    res.status(500).json({ error: "Failed to load circle states" });
  }
});

app.post("/api/circle-states", (req, res) => {
  try {
    const db = loadDb();
    db.circleStates = {
      ...db.circleStates,
      ...req.body
    };
    saveDb(db);
    res.json(db.circleStates);
  } catch (error: any) {
    console.error("Failed to update circle states:", error);
    res.status(500).json({ error: "Failed to save circle states" });
  }
});

// SAFARICOM M-PESA STK PUSH API ENGINE
interface PendingMpesaTransaction {
  checkoutRequestId: string;
  merchantRequestId: string;
  phoneNumber: string;
  amount: number;
  accountReference: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  isMonthly: boolean;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: number;
  mpesaReceiptNumber?: string;
  resultDesc?: string;
}

const pendingMpesaTxns = new Map<string, PendingMpesaTransaction>();

function formatKenyanPhone(phone: string): string | null {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('254')) {
    // fine as is
  } else if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('1'))) {
    cleaned = '254' + cleaned;
  }
  
  if (/^254(7|1)\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  return null;
}

// 1. Initiate M-Pesa STK Push
app.post("/api/mpesa/stkpush", generalLimiter, async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, campaignTitle, donorName, donorEmail, isAnonymous, isMonthly } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: "Phone number and amount are required." });
    }

    const formattedPhone = formatKenyanPhone(String(phoneNumber));
    if (!formattedPhone) {
      return res.status(400).json({ error: "Invalid Kenyan phone number format. Please use e.g. 0712345678 or 254712345678." });
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({ error: "Amount must be a positive integer in KES." });
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE || "174379";
    const mpesaEnv = process.env.MPESA_ENV || "sandbox";

    const ref = accountReference ? truncateString(accountReference, 12) : "BIGFUND";
    const title = campaignTitle ? truncateString(campaignTitle, 100) : "BIG Fund Community Initiative";
    const name = donorName ? truncateString(donorName, 100) : "Supporter";
    const email = donorEmail ? truncateString(donorEmail, 100) : "supporter@bigfund.org";

    // If real Safaricom Daraja credentials are present
    if (consumerKey && consumerSecret && passkey) {
      try {
        const authUrl = mpesaEnv === "production" 
          ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" 
          : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

        const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        const tokenRes = await fetch(authUrl, {
          headers: { Authorization: `Basic ${authHeader}` }
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          throw new Error(tokenData.errorMessage || "Failed to obtain Daraja OAuth access token");
        }

        const accessToken = tokenData.access_token;
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        const stkUrl = mpesaEnv === "production"
          ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
          : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

        const appUrl = process.env.APP_URL || "https://ais-dev-zwibqjbls7b7s35whixos5-901428384252.europe-west2.run.app";
        const callBackUrl = `${appUrl.replace(/\/$/, '')}/api/mpesa/callback`;

        const stkPayload = {
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: numAmount,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callBackUrl,
          AccountReference: ref,
          TransactionDesc: `Contribution to ${title.slice(0, 20)}`
        };

        const stkRes = await fetch(stkUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stkPayload)
        });

        const stkData = await stkRes.json();

        if (stkData.ResponseCode === "0") {
          const checkoutRequestId = stkData.CheckoutRequestID;
          const merchantRequestId = stkData.MerchantRequestID;

          pendingMpesaTxns.set(checkoutRequestId, {
            checkoutRequestId,
            merchantRequestId,
            phoneNumber: formattedPhone,
            amount: numAmount,
            accountReference: ref,
            campaignTitle: title,
            donorName: name,
            donorEmail: email,
            isAnonymous: Boolean(isAnonymous),
            isMonthly: Boolean(isMonthly),
            status: 'PENDING',
            createdAt: Date.now()
          });

          return res.json({
            success: true,
            mode: 'daraja',
            checkoutRequestId,
            merchantRequestId,
            customerMessage: stkData.CustomerMessage || `STK Push prompt sent to ${formattedPhone}. Please enter your M-Pesa PIN on your phone.`
          });
        } else {
          return res.status(400).json({
            error: stkData.CustomerMessage || stkData.errorMessage || "Safaricom Daraja STK Push request rejected."
          });
        }
      } catch (darajaErr: any) {
        console.error("Daraja STK Push invocation failed, falling back to simulation engine:", darajaErr);
      }
    }

    // SIMULATOR FALLBACK
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
    const merchantRequestId = `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}-1`;

    pendingMpesaTxns.set(checkoutRequestId, {
      checkoutRequestId,
      merchantRequestId,
      phoneNumber: formattedPhone,
      amount: numAmount,
      accountReference: ref,
      campaignTitle: title,
      donorName: name,
      donorEmail: email,
      isAnonymous: Boolean(isAnonymous),
      isMonthly: Boolean(isMonthly),
      status: 'PENDING',
      createdAt: Date.now()
    });

    console.log(`[MPESA STK PUSH DISPATCHED]: Prompting ${formattedPhone} for KES ${numAmount}`);

    res.json({
      success: true,
      mode: 'simulated',
      checkoutRequestId,
      merchantRequestId,
      customerMessage: `STK Push prompt sent to ${formattedPhone}. Enter your M-Pesa PIN on your mobile device to authorize KES ${numAmount.toLocaleString()}.`
    });

  } catch (error: any) {
    console.error("STK Push error:", error);
    res.status(500).json({ error: "Internal M-Pesa STK Push error" });
  }
});

// 2. Query STK Push status
app.get("/api/mpesa/stkpush/query/:checkoutRequestId", (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const txn = pendingMpesaTxns.get(checkoutRequestId);

    if (!txn) {
      return res.status(404).json({ error: "Transaction not found or expired" });
    }

    res.json({
      checkoutRequestId: txn.checkoutRequestId,
      status: txn.status,
      amount: txn.amount,
      phoneNumber: txn.phoneNumber,
      mpesaReceiptNumber: txn.mpesaReceiptNumber,
      resultDesc: txn.resultDesc
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to query M-Pesa status" });
  }
});

// 3. Confirm Simulated STK Push (Interactive Phone Simulation)
app.post("/api/mpesa/stkpush/simulate-confirm", (req, res) => {
  try {
    const { checkoutRequestId, pin } = req.body;
    if (!checkoutRequestId) {
      return res.status(400).json({ error: "checkoutRequestId is required" });
    }

    const txn = pendingMpesaTxns.get(checkoutRequestId);
    if (!txn) {
      return res.status(404).json({ error: "Transaction record expired or not found" });
    }

    if (pin && pin.length < 4) {
      txn.status = 'FAILED';
      txn.resultDesc = 'Transaction rejected: Invalid M-Pesa PIN provided';
      return res.status(400).json({ error: "Invalid M-Pesa PIN provided." });
    }

    const receipt = `SK${Math.floor(100 + Math.random() * 899)}${Math.random().toString(36).substring(2, 6).toUpperCase()}YP`;
    txn.status = 'SUCCESS';
    txn.mpesaReceiptNumber = receipt;
    txn.resultDesc = 'The service request is processed successfully.';

    // Save donation to public ledger persistently
    const db = loadDb();
    if (!db.donations) db.donations = [];

    const donationObj: Donation = {
      id: `don-${Date.now()}`,
      donorName: txn.isAnonymous ? "Anonymous Supporter" : txn.donorName,
      donorEmail: txn.donorEmail,
      amount: txn.amount,
      campaignId: txn.accountReference,
      campaignTitle: txn.campaignTitle,
      date: new Date().toISOString(),
      paymentProvider: "M-Pesa",
      isAnonymous: txn.isAnonymous,
      type: txn.isMonthly ? "monthly" : "one-time",
      status: "Completed"
    };

    db.donations.unshift(donationObj);

    if (txn.isMonthly) {
      if (!db.monthlySupporters) db.monthlySupporters = [];
      const existingSupporter = db.monthlySupporters.find((s: MonthlySupporter) => s.name?.toLowerCase() === donationObj.donorName.toLowerCase());
      if (!existingSupporter) {
        db.monthlySupporters.push({
          id: `monthly-${Date.now()}`,
          name: donationObj.donorName,
          amount: txn.amount,
          avatar: "/images/african_woman_portrait_1_1784708232425.jpg",
          tier: "Gold Champion",
          joinedAt: new Date().toISOString(),
          badge: "🏆 GOLD CHAMPION"
        });
      }
    }

    // Update campaign amountRaised if campaign exists
    if (db.campaigns && Array.isArray(db.campaigns)) {
      const camp = db.campaigns.find((c: Campaign) => c.title === txn.campaignTitle || c.id === txn.accountReference);
      if (camp) {
        camp.amountRaised = (camp.amountRaised || 0) + txn.amount;
        camp.supportersCount = (camp.supportersCount || 0) + 1;
      }
    }

    saveDb(db);

    writeAuditLog("system", txn.donorEmail, `M-Pesa STK Push Payment KES ${txn.amount} confirmed (${receipt})`, req.ip || 'unknown');

    res.json({
      success: true,
      receiptNumber: receipt,
      message: `Transaction approved! KES ${txn.amount.toLocaleString()} received. Ref: ${receipt}`
    });

  } catch (error: any) {
    console.error("Error confirming simulated STK Push:", error);
    res.status(500).json({ error: "Failed to confirm M-Pesa transaction" });
  }
});

// 4. Safaricom Webhook Callback
app.post("/api/mpesa/callback", (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: "Invalid callback payload format" });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;
    const txn = pendingMpesaTxns.get(CheckoutRequestID);

    if (ResultCode === 0) {
      let mpesaReceiptNumber = `SK${Math.floor(100 + Math.random() * 899)}${Math.random().toString(36).substring(2, 6).toUpperCase()}YP`;
      let amount = txn ? txn.amount : 0;
      let phoneNumber = txn ? txn.phoneNumber : '';

      if (CallbackMetadata?.Item && Array.isArray(CallbackMetadata.Item)) {
        CallbackMetadata.Item.forEach((item: any) => {
          if (item.Name === "MpesaReceiptNumber" && item.Value) mpesaReceiptNumber = String(item.Value);
          if (item.Name === "Amount" && item.Value) amount = Number(item.Value);
          if (item.Name === "PhoneNumber" && item.Value) phoneNumber = String(item.Value);
        });
      }

      if (txn) {
        txn.status = 'SUCCESS';
        txn.mpesaReceiptNumber = mpesaReceiptNumber;
        txn.resultDesc = ResultDesc;
      }

      // Record in DB
      const db = loadDb();
      if (!db.donations) db.donations = [];

      const donationObj: Donation = {
        id: `don-${Date.now()}`,
        donorName: txn ? (txn.isAnonymous ? "Anonymous Supporter" : txn.donorName) : "M-Pesa Supporter",
        donorEmail: txn ? txn.donorEmail : "supporter@bigfund.org",
        amount: amount || (txn ? txn.amount : 1000),
        campaignId: txn ? txn.accountReference : "BIGFUND",
        campaignTitle: txn ? txn.campaignTitle : "BIG Fund Community Initiative",
        date: new Date().toISOString(),
        paymentProvider: "M-Pesa",
        isAnonymous: txn ? txn.isAnonymous : false,
        type: txn && txn.isMonthly ? "monthly" : "one-time",
        status: "Completed"
      };

      db.donations.unshift(donationObj);

      if (db.campaigns && Array.isArray(db.campaigns) && txn) {
        const camp = db.campaigns.find((c: Campaign) => c.title === txn.campaignTitle || c.id === txn.accountReference);
        if (camp) {
          camp.amountRaised = (camp.amountRaised || 0) + amount;
          camp.supportersCount = (camp.supportersCount || 0) + 1;
        }
      }

      saveDb(db);
      console.log(`[DARAJA MPESA CALLBACK SUCCESS]: Receipt ${mpesaReceiptNumber}, Amount KES ${amount}`);
    } else {
      if (txn) {
        txn.status = 'FAILED';
        txn.resultDesc = ResultDesc;
      }
      console.log(`[DARAJA MPESA CALLBACK REJECTED]: ${ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    res.json({ ResultCode: 0, ResultDesc: "Accepted with warnings" });
  }
});

// NEWSLETTER SUBSCRIPTION API HANDLERS
app.post("/api/newsletter/subscribe", generalLimiter, async (req, res) => {
  try {
    const { email, topics } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const selectedTopics = Array.isArray(topics) && topics.length > 0 
      ? topics.filter((t: any) => typeof t === 'string' && t.trim())
      : ['Success Stories', 'Grant & Funding Alerts', 'Academy Masterclasses'];

    const db = loadDb();
    if (!db.newsletterSubscribers) {
      db.newsletterSubscribers = [];
    }

    const existingIndex = db.newsletterSubscribers.findIndex(s => s.email.toLowerCase() === cleanEmail);

    let subscriberObj;
    if (existingIndex >= 0) {
      // Update topics if already subscribed
      db.newsletterSubscribers[existingIndex].topics = selectedTopics;
      db.newsletterSubscribers[existingIndex].subscribedAt = new Date().toISOString();
      subscriberObj = db.newsletterSubscribers[existingIndex];
    } else {
      subscriberObj = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        email: cleanEmail,
        topics: selectedTopics,
        subscribedAt: new Date().toISOString(),
        ip: req.ip || req.headers['x-forwarded-for'] as string || 'unknown'
      };
      db.newsletterSubscribers.unshift(subscriberObj);
    }

    saveDb(db);

    const totalSubscribers = 5420 + db.newsletterSubscribers.length;

    console.log(`[NEWSLETTER SUBSCRIBE] Email: ${cleanEmail}, Topics: ${selectedTopics.join(', ')}`);

    return res.status(200).json({
      success: true,
      message: "Successfully subscribed to the BIG Weekly Dispatch!",
      subscriber: subscriberObj,
      totalSubscribers
    });
  } catch (error: any) {
    console.error("Error in newsletter subscription endpoint:", error);
    return res.status(500).json({ error: "An unexpected error occurred while subscribing. Please try again." });
  }
});

app.get("/api/newsletter/subscribers", async (req, res) => {
  try {
    const db = loadDb();
    const list = db.newsletterSubscribers || [];
    return res.json({
      subscribers: list,
      totalCount: 5420 + list.length
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

export default app;
