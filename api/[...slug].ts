import * as crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  buildOtpEmailPayload,
  buildPasswordResetEmailPayload,
  buildWelcomeEmailPayload,
} from "./email";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_KEY_1 ||
  "";

const RESEND_API_KEY =
  process.env.RESEND_API_KEY ||
  process.env.VITE_RESEND_API_KEY ||
  process.env.NEXT_PUBLIC_RESEND_API_KEY ||
  process.env.RESEND_KEY ||
  process.env.RESEND_API_KEY_1 ||
  "";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "big_sister_secure_signing_secret_2026";
const OTP_TTL_MS = 5 * 60 * 1000;

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const otpStore = new Map<
  string,
  { codeHash: string; expiresAt: number; actionName: string }
>();

interface RouteRequest {
  method: string;
  path: string[];
  body: any;
  headers: Record<string, string | undefined>;
}

function hashString(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function createSessionToken(userId: string, email: string) {
  const payload = JSON.stringify({
    userId,
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const payloadBase64 = Buffer.from(payload).toString("base64");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");
  return `${payloadBase64}.${signature}`;
}

function verifySessionToken(token: string) {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;
    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadBase64)
      .digest("hex");
    if (signature !== expected) return null;
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf-8"),
    );
    if (Date.now() > payload.exp) return null;
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}

function setJsonResponse(res: any, status: number, data: any) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function getBearerToken(req: any) {
  const auth = req.headers["authorization"] || req.headers["Authorization"];
  if (!auth || typeof auth !== "string") return null;
  const parts = auth.split(" ");
  return parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;
}

async function parseJsonBody(req: any) {
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    return {};
  }

  if (req.body && typeof req.body !== "string") {
    return req.body;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (!chunk) continue;
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf-8").trim();
  if (!rawBody) return {};

  const contentType = String(req.headers["content-type"] || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (
    contentType === "application/json" ||
    rawBody.startsWith("{") ||
    rawBody.startsWith("[")
  ) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  return {};
}

async function verifyAuth(req: any, res: any) {
  const token = getBearerToken(req);
  if (!token) {
    setJsonResponse(res, 401, { error: "Access token is missing" });
    return null;
  }
  const session = verifySessionToken(token);
  if (!session) {
    setJsonResponse(res, 403, { error: "Invalid or expired session token" });
    return null;
  }
  return session;
}

function formatKenyanPhone(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith("254")) return cleaned;
  return null;
}

function buildUserRecord(data: any) {
  return {
    id: data.id,
    name: data.name || "BIG Member",
    email: data.email || null,
    avatar:
      data.avatar ||
      data.avatar ||
      "/images/african_woman_portrait_1_1784708232425.jpg",
    title: data.title || "",
    city: data.city || "",
    rank: data.rank || "Learner",
    skills: data.skills || [],
    interests: data.interests || [],
    bio: data.bio || "",
    points: data.points ?? 0,
    badges: data.badges || [],
    business_stage: data.business_stage || null,
    mentoring_capacity: data.mentoring_capacity || null,
    followingIds: data.followingIds || [],
    followerIds: data.followerIds || [],
    circleIds: data.circleIds || [],
    isSuperAdmin: data.isSuperAdmin || false,
    isModerator: data.isModerator || false,
    joinedAt: data.joinedAt || new Date().toISOString(),
    website: data.website || null,
    linkedinUrl: data.linkedinUrl || null,
    githubUrl: data.githubUrl || null,
    twitterUrl: data.twitterUrl || null,
    company: data.company || null,
    industry: data.industry || null,
    certifications: data.certifications || [],
    endorsements: data.endorsements || [],
    recommendations: data.recommendations || [],
    experience: data.experience || [],
    education: data.education || [],
    biometricCredentialId: data.biometricCredentialId || null,
    passwordHash: data.passwordHash || null,
    passwordSalt: data.passwordSalt || null,
    pinHash: data.pinHash || null,
    pinSalt: data.pinSalt || null,
  };
}

function sanitizeUserOutput(user: any) {
  if (!user) return null;
  const {
    passwordHash,
    passwordSalt,
    pinHash,
    pinSalt,
    biometricCredentialId,
    ...rest
  } = user;
  return rest;
}

async function getSupabaseTableRows(table: string) {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    return [];
  }
  return data || [];
}

async function upsertSupabaseTable(table: string, records: any[]) {
  if (!supabase || !Array.isArray(records)) return;
  const { error } = await supabase
    .from(table)
    .upsert(records, { onConflict: "id" });
  if (error) {
    console.warn(`Supabase upsert ${table} failed:`, error.message || error);
  }
}

async function handleEmailSend(req: any, res: any) {
  const body = req.body || {};
  const {
    to,
    subject,
    body: textBody,
    template,
    donorName,
    campaignTitle,
    amount,
    receiptNumber,
  } = body;
  if (!to || !subject) {
    return setJsonResponse(res, 400, {
      error: "Missing email destination or subject",
    });
  }

  if (!resendClient) {
    return setJsonResponse(res, 503, {
      error:
        "Email service is not configured. Please set RESEND_API_KEY in environment variables.",
    });
  }

  let payload = {
    subject,
    text: textBody || "",
    html: `<div>${textBody || ""}</div>`,
  };

  if (template === "otp" && typeof donorName === "string") {
    payload = buildOtpEmailPayload(donorName, "Security Action");
  }
  if (template === "receipt") {
    payload = {
      subject: subject || `Donation receipt #${receiptNumber}`,
      text: `Thank you for your donation of ${amount} USD to ${campaignTitle}. Receipt #${receiptNumber}.`,
      html: `<p>Thank you for your donation of <strong>${amount} USD</strong> to <strong>${campaignTitle}</strong>.</p><p>Receipt #${receiptNumber}</p>`,
    };
  }
  if (template === "welcome") {
    payload = buildWelcomeEmailPayload(donorName || "BIG Sister");
  }

  try {
    const result = await resendClient.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "BIG Foundation <info@beindependentgal.com>",
      to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    return setJsonResponse(res, 200, {
      success: true,
      message: "Email queued for delivery.",
      emailId: (result as any).id,
      provider: "resend",
    });
  } catch (err: any) {
    console.error("Email send failed:", err);
    return setJsonResponse(res, 500, {
      error: err.message || "Failed to send email",
    });
  }
}

function findRoute(req: any): RouteRequest {
  const rawPath = req.query.slug;
  const path = Array.isArray(rawPath) ? rawPath : rawPath ? [rawPath] : [];
  return {
    method: req.method?.toUpperCase() || "GET",
    path,
    body: req.body || {},
    headers: req.headers || {},
  };
}

async function handleGetDb(req: any, res: any) {
  if (!supabase) {
    return setJsonResponse(res, 500, {
      error: "Supabase is not configured on the backend.",
    });
  }

  const [
    members,
    posts,
    events,
    challenges,
    conversations,
    mentorshipPairs,
    forumThreads,
    circleStates,
    campaigns,
    donations,
    monthlySupporters,
    impactStories,
  ] = await Promise.all([
    getSupabaseTableRows("big_members"),
    getSupabaseTableRows("big_posts"),
    getSupabaseTableRows("big_events"),
    getSupabaseTableRows("big_challenges"),
    getSupabaseTableRows("big_conversations"),
    getSupabaseTableRows("big_mentorship_pairs"),
    getSupabaseTableRows("big_forum_threads"),
    getSupabaseTableRows("big_circle_states"),
    getSupabaseTableRows("big_campaigns"),
    getSupabaseTableRows("big_donations"),
    getSupabaseTableRows("big_monthly_supporters"),
    getSupabaseTableRows("big_impact_stories"),
  ]);

  const circleStateMap = (circleStates as any[]).reduce(
    (acc, item: any) => {
      if (item.id && item.payload) {
        acc[item.id] = item.payload;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  return setJsonResponse(res, 200, {
    members: members.map(sanitizeUserOutput),
    posts,
    events,
    challenges,
    conversations,
    mentorshipPairs,
    forumThreads,
    circleStates: circleStateMap,
    campaigns,
    donations,
    monthlySupporters,
    impactStories,
  });
}

async function handleSyncDb(req: any, res: any) {
  const session = await verifyAuth(req, res);
  if (!session) return;

  if (!supabase) {
    return setJsonResponse(res, 500, {
      error: "Supabase is not configured on the backend.",
    });
  }

  const payload = req.body || {};
  const updateTasks: Promise<void>[] = [];

  if (Array.isArray(payload.members)) {
    updateTasks.push(upsertSupabaseTable("big_members", payload.members));
  }
  if (Array.isArray(payload.posts)) {
    updateTasks.push(upsertSupabaseTable("big_posts", payload.posts));
  }
  if (Array.isArray(payload.events)) {
    updateTasks.push(upsertSupabaseTable("big_events", payload.events));
  }
  if (Array.isArray(payload.challenges)) {
    updateTasks.push(upsertSupabaseTable("big_challenges", payload.challenges));
  }
  if (Array.isArray(payload.conversations)) {
    updateTasks.push(
      upsertSupabaseTable("big_conversations", payload.conversations),
    );
  }
  if (Array.isArray(payload.mentorshipPairs)) {
    updateTasks.push(
      upsertSupabaseTable("big_mentorship_pairs", payload.mentorshipPairs),
    );
  }
  if (Array.isArray(payload.forumThreads)) {
    updateTasks.push(
      upsertSupabaseTable("big_forum_threads", payload.forumThreads),
    );
  }
  if (payload.circleStates && typeof payload.circleStates === "object") {
    const entries = Object.entries(payload.circleStates).map(
      ([id, payloadState]) => ({ id, payload: payloadState }),
    );
    updateTasks.push(upsertSupabaseTable("big_circle_states", entries));
  }
  if (Array.isArray(payload.campaigns)) {
    updateTasks.push(upsertSupabaseTable("big_campaigns", payload.campaigns));
  }
  if (Array.isArray(payload.donations)) {
    updateTasks.push(upsertSupabaseTable("big_donations", payload.donations));
  }
  if (Array.isArray(payload.monthlySupporters)) {
    updateTasks.push(
      upsertSupabaseTable("big_monthly_supporters", payload.monthlySupporters),
    );
  }
  if (Array.isArray(payload.impactStories)) {
    updateTasks.push(
      upsertSupabaseTable("big_impact_stories", payload.impactStories),
    );
  }

  await Promise.all(updateTasks);
  return setJsonResponse(res, 200, { state: payload });
}

async function handleForumThreads(req: any, res: any) {
  if (!supabase) {
    return setJsonResponse(res, 200, []);
  }
  if (req.method === "GET") {
    const rows = await getSupabaseTableRows("big_forum_threads");
    return setJsonResponse(res, 200, rows);
  }
  if (req.method === "POST") {
    const body = req.body;
    if (Array.isArray(body)) {
      await upsertSupabaseTable("big_forum_threads", body);
      return setJsonResponse(res, 200, body);
    }
    if (body && body.id) {
      await upsertSupabaseTable("big_forum_threads", [body]);
      return setJsonResponse(res, 200, [body]);
    }
    return setJsonResponse(res, 400, { error: "Invalid forum thread payload" });
  }
  return setJsonResponse(res, 405, { error: "Method not allowed" });
}

async function handleCircleStates(req: any, res: any) {
  if (!supabase) {
    return setJsonResponse(res, 200, {});
  }
  if (req.method === "GET") {
    const rows = await getSupabaseTableRows("big_circle_states");
    const result = (rows as any[]).reduce(
      (acc, item) => {
        if (item.id && item.payload) acc[item.id] = item.payload;
        return acc;
      },
      {} as Record<string, any>,
    );
    return setJsonResponse(res, 200, result);
  }
  if (req.method === "POST") {
    const body = req.body;
    if (!body || typeof body !== "object") {
      return setJsonResponse(res, 400, {
        error: "Invalid circle state payload",
      });
    }
    const entries = Object.entries(body).map(([id, payloadState]) => ({
      id,
      payload: payloadState,
    }));
    await upsertSupabaseTable("big_circle_states", entries);
    const result = entries.reduce(
      (acc, item) => {
        acc[item.id] = item.payload;
        return acc;
      },
      {} as Record<string, any>,
    );
    return setJsonResponse(res, 200, result);
  }
  return setJsonResponse(res, 405, { error: "Method not allowed" });
}

async function handleCollection(
  req: any,
  res: any,
  table: string,
  sanitizer?: (item: any) => any,
) {
  if (!supabase) {
    return setJsonResponse(res, 200, []);
  }

  if (req.method === "GET") {
    const rows = await getSupabaseTableRows(table);
    const normalized = Array.isArray(rows)
      ? rows.map((item) => (sanitizer ? sanitizer(item) : item))
      : [];
    return setJsonResponse(res, 200, normalized);
  }

  if (req.method === "POST") {
    const body = req.body;
    if (Array.isArray(body)) {
      const records = sanitizer ? body.map(sanitizer) : body;
      await upsertSupabaseTable(table, records);
      return setJsonResponse(res, 200, records);
    }
    if (body && typeof body === "object") {
      const record = sanitizer ? sanitizer(body) : body;
      await upsertSupabaseTable(table, [record]);
      return setJsonResponse(res, 200, [record]);
    }
    return setJsonResponse(res, 400, { error: "Invalid payload" });
  }

  return setJsonResponse(res, 405, { error: "Method not allowed" });
}

async function handleMembers(req: any, res: any) {
  return handleCollection(req, res, "big_members", buildUserRecord);
}

async function handlePosts(req: any, res: any) {
  return handleCollection(req, res, "big_posts");
}

async function handleEvents(req: any, res: any) {
  return handleCollection(req, res, "big_events");
}

async function handleChallenges(req: any, res: any) {
  return handleCollection(req, res, "big_challenges");
}

async function handleConversations(req: any, res: any) {
  return handleCollection(req, res, "big_conversations");
}

async function handleMentorshipPairs(req: any, res: any) {
  return handleCollection(req, res, "big_mentorship_pairs");
}

async function handleMpesa(req: any, res: any, route: string[]) {
  if (route[1] === "stkpush") {
    if (req.method === "POST" && route.length === 2) {
      const body = req.body || {};
      const phoneNumber = String(body.phoneNumber || body.phone || "");
      const amount = Number(body.amount || 0);
      const formattedPhone = formatKenyanPhone(phoneNumber);
      if (!formattedPhone) {
        return setJsonResponse(res, 400, {
          error: "Invalid Kenyan phone number",
        });
      }

      const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;
      const pendingTxns = pendingMpesaTxns;
      pendingTxns.set(checkoutRequestId, {
        checkoutRequestId,
        merchantRequestId: `MR_${Date.now()}`,
        phoneNumber: formattedPhone,
        amount,
        accountReference: body.accountReference || "BIGFUND",
        campaignTitle: body.campaignTitle || "BIG Fund Campaign",
        donorName: body.donorName || "Supporter",
        donorEmail: body.donorEmail || "supporter@bigfund.org",
        isAnonymous: Boolean(body.isAnonymous),
        isMonthly: Boolean(body.isMonthly),
        status: "PENDING",
        createdAt: Date.now(),
      });

      return setJsonResponse(res, 200, {
        success: true,
        mode: "simulated",
        checkoutRequestId,
        merchantRequestId: `MR_${Date.now()}`,
        customerMessage: `STK Push prompt sent to ${formattedPhone}. Enter your PIN on your phone.`,
      });
    }
    if (req.method === "GET" && route.length === 3) {
      const checkoutRequestId = route[2];
      const txn = pendingMpesaTxns.get(checkoutRequestId);
      if (!txn) {
        return setJsonResponse(res, 404, { error: "Transaction not found" });
      }
      return setJsonResponse(res, 200, {
        checkoutRequestId: txn.checkoutRequestId,
        status: txn.status,
        amount: txn.amount,
        phoneNumber: txn.phoneNumber,
        mpesaReceiptNumber: txn.mpesaReceiptNumber,
        resultDesc: txn.resultDesc,
      });
    }
    return setJsonResponse(res, 405, { error: "Method not allowed" });
  }
  if (
    route[1] === "stkpush" &&
    route[2] === "simulate-confirm" &&
    req.method === "POST"
  ) {
    const body = req.body || {};
    const checkoutRequestId = String(body.checkoutRequestId || "");
    const pin = String(body.pin || "");
    if (!checkoutRequestId) {
      return setJsonResponse(res, 400, {
        error: "checkoutRequestId is required",
      });
    }
    const txn = pendingMpesaTxns.get(checkoutRequestId);
    if (!txn) {
      return setJsonResponse(res, 404, { error: "Transaction not found" });
    }
    if (!pin || pin.length < 4) {
      return setJsonResponse(res, 400, {
        error: "Invalid M-Pesa PIN provided",
      });
    }
    txn.status = "SUCCESS";
    txn.mpesaReceiptNumber = `SK${Math.floor(100 + Math.random() * 899)}${Math.random().toString(36).substring(2, 6).toUpperCase()}YP`;
    txn.resultDesc = "The M-Pesa transaction was confirmed successfully.";
    return setJsonResponse(res, 200, {
      success: true,
      receiptNumber: txn.mpesaReceiptNumber,
      message: "M-Pesa transaction confirmed.",
    });
  }
  return setJsonResponse(res, 404, { error: "Unsupported M-Pesa route" });
}

const pendingMpesaTxns = new Map<
  string,
  {
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
    status: "PENDING" | "SUCCESS" | "FAILED";
    createdAt: number;
    mpesaReceiptNumber?: string;
    resultDesc?: string;
  }
>();

async function handleAuthRoute(req: any, res: any, route: string[]) {
  const method = req.method?.toUpperCase() || "GET";
  if (route[1] === "verify-session" && method === "GET") {
    const session = await verifyAuth(req, res);
    if (!session) return;
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const { data, error } = await supabase
      .from("big_members")
      .select("*")
      .eq("id", session.userId)
      .single();
    if (error || !data) {
      return setJsonResponse(res, 404, { error: "User not found" });
    }
    return setJsonResponse(res, 200, {
      valid: true,
      user: sanitizeUserOutput(data),
    });
  }

  if (route[1] === "register" && method === "POST") {
    const { name, email, password, biometricCredentialId } = req.body || {};
    if (!email || !password || !name) {
      return setJsonResponse(res, 400, {
        error: "Missing registration details",
      });
    }
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: existing } = await supabase
      .from("big_members")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (existing) {
      return setJsonResponse(res, 409, {
        error: "A user with that email already exists.",
      });
    }
    const salt = generateSalt();
    const pinSalt = generateSalt();
    const passwordHash = hashPassword(String(password), salt);
    const pinHash = hashPassword("123456", pinSalt);
    const id = `user-${Date.now()}`;
    const member = buildUserRecord({
      id,
      name,
      email: normalizedEmail,
      avatar: `/images/african_woman_portrait_1_1784708232425.jpg`,
      rank: "Learner",
      passwordHash,
      passwordSalt: salt,
      pinHash,
      pinSalt,
      biometricCredentialId: biometricCredentialId || null,
      joinedAt: new Date().toISOString(),
    });
    const { error } = await supabase.from("big_members").insert([member]);
    if (error) {
      return setJsonResponse(res, 500, {
        error: "Failed to create user record",
      });
    }
    const token = createSessionToken(id, normalizedEmail);
    return setJsonResponse(res, 200, {
      token,
      user: sanitizeUserOutput(member),
    });
  }

  if (route[1] === "login" && method === "POST") {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return setJsonResponse(res, 400, { error: "Missing login credentials" });
    }
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const normalizedEmail = String(email).trim().toLowerCase();
    const { data, error } = await supabase
      .from("big_members")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (error || !data) {
      return setJsonResponse(res, 401, { error: "Invalid email or password" });
    }
    if (!data.passwordHash || !data.passwordSalt) {
      return setJsonResponse(res, 401, { error: "Invalid email or password" });
    }
    const passwordHash = hashPassword(String(password), data.passwordSalt);
    if (passwordHash !== data.passwordHash) {
      return setJsonResponse(res, 401, { error: "Invalid email or password" });
    }
    const token = createSessionToken(data.id, normalizedEmail);
    return setJsonResponse(res, 200, { token, user: sanitizeUserOutput(data) });
  }

  if (route[1] === "biometric-enroll" && method === "POST") {
    const session = await verifyAuth(req, res);
    if (!session) return;
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const credentialId = req.body?.biometricCredentialId;
    if (!credentialId) {
      return setJsonResponse(res, 400, {
        error: "Missing biometric credential ID",
      });
    }
    const { error } = await supabase
      .from("big_members")
      .update({ biometricCredentialId: credentialId })
      .eq("id", session.userId);
    if (error) {
      return setJsonResponse(res, 500, {
        error: "Failed to enroll biometric credential",
      });
    }
    const { data } = await supabase
      .from("big_members")
      .select("*")
      .eq("id", session.userId)
      .single();
    return setJsonResponse(res, 200, {
      success: true,
      user: sanitizeUserOutput(data),
    });
  }

  if (route[1] === "biometric-login" && method === "POST") {
    const { email, biometricCredentialId } = req.body || {};
    if (!email || !biometricCredentialId) {
      return setJsonResponse(res, 400, { error: "Missing credentials" });
    }
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const normalizedEmail = String(email).trim().toLowerCase();
    const { data, error } = await supabase
      .from("big_members")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (
      error ||
      !data ||
      data.biometricCredentialId !== biometricCredentialId
    ) {
      return setJsonResponse(res, 401, { error: "Biometric login failed" });
    }
    const token = createSessionToken(data.id, normalizedEmail);
    return setJsonResponse(res, 200, { token, user: sanitizeUserOutput(data) });
  }

  if (route[1] === "request-otp" && method === "POST") {
    const { email, actionName } = req.body || {};
    if (!email) {
      return setJsonResponse(res, 400, { error: "Missing email address" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = hashString(code);
    otpStore.set(normalizedEmail, {
      codeHash,
      expiresAt: Date.now() + OTP_TTL_MS,
      actionName: String(actionName || "Sensitive Action"),
    });
    const payload = buildOtpEmailPayload(
      code,
      actionName || "Sensitive Action",
    );
    if (resendClient) {
      try {
        await resendClient.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "BIG Foundation <info@beindependentgal.com>",
          to: normalizedEmail,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });
      } catch (err: any) {
        console.warn("Failed to send OTP email:", err);
      }
    } else {
      console.warn(`OTP code for ${normalizedEmail}: ${code}`);
    }
    return setJsonResponse(res, 200, {
      success: true,
      message:
        "OTP code dispatched to your email if email service is configured.",
    });
  }

  if (route[1] === "verify-otp" && method === "POST") {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return setJsonResponse(res, 400, { error: "Missing email or code" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);
    if (!stored || Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedEmail);
      return setJsonResponse(res, 400, {
        error: "OTP code is invalid or expired",
      });
    }
    if (stored.codeHash !== hashString(String(code))) {
      return setJsonResponse(res, 400, { error: "OTP code is invalid" });
    }
    otpStore.delete(normalizedEmail);
    return setJsonResponse(res, 200, { success: true });
  }

  if (route[1] === "reset-password" && method === "POST") {
    const { email, code, password } = req.body || {};
    if (!email || !code || !password) {
      return setJsonResponse(res, 400, {
        error: "Missing password reset payload",
      });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);
    if (
      !stored ||
      Date.now() > stored.expiresAt ||
      stored.codeHash !== hashString(String(code))
    ) {
      otpStore.delete(normalizedEmail);
      return setJsonResponse(res, 400, {
        error: "OTP code is invalid or expired",
      });
    }
    otpStore.delete(normalizedEmail);
    if (!supabase)
      return setJsonResponse(res, 500, {
        error: "Supabase is not configured.",
      });
    const salt = generateSalt();
    const passwordHash = hashPassword(String(password), salt);
    const { error } = await supabase
      .from("big_members")
      .update({ passwordHash, passwordSalt: salt })
      .eq("email", normalizedEmail);
    if (error) {
      return setJsonResponse(res, 500, { error: "Failed to update password" });
    }
    return setJsonResponse(res, 200, {
      success: true,
      message: "Password has been reset successfully.",
    });
  }

  if (route[1] === "google" && route[2] === "url") {
    return setJsonResponse(res, 501, {
      error: "Google auth is not configured for this deployment.",
    });
  }

  return setJsonResponse(res, 404, { error: "Auth route not found" });
}

async function handleSecurityRoute(req: any, res: any, route: string[]) {
  const session = await verifyAuth(req, res);
  if (!session) return;
  if (!supabase)
    return setJsonResponse(res, 500, { error: "Supabase is not configured." });

  if (route[1] === "set-pin" && req.method === "POST") {
    const pin = String(req.body?.pin || "");
    if (!pin || pin.length !== 6) {
      return setJsonResponse(res, 400, {
        error: "PIN must be exactly 6 digits",
      });
    }
    const salt = generateSalt();
    const hash = hashPassword(pin, salt);
    const { error } = await supabase
      .from("big_members")
      .update({ pinHash: hash, pinSalt: salt })
      .eq("id", session.userId);
    if (error) {
      return setJsonResponse(res, 500, {
        error: "Failed to store security PIN",
      });
    }
    return setJsonResponse(res, 200, { success: true });
  }

  if (route[1] === "verify-pin" && req.method === "POST") {
    const pin = String(req.body?.pin || "");
    if (!pin) {
      return setJsonResponse(res, 400, { error: "PIN is required" });
    }
    const { data, error } = await supabase
      .from("big_members")
      .select("pinHash, pinSalt")
      .eq("id", session.userId)
      .maybeSingle();
    if (error || !data || !data.pinHash || !data.pinSalt) {
      return setJsonResponse(res, 400, {
        error: "Security PIN is not configured",
      });
    }
    const hash = hashPassword(pin, data.pinSalt);
    if (hash !== data.pinHash) {
      return setJsonResponse(res, 400, { error: "Incorrect PIN" });
    }
    return setJsonResponse(res, 200, { success: true });
  }

  if (route[1] === "audit-logs" && req.method === "GET") {
    const rows = await getSupabaseTableRows("big_audit_logs");
    return setJsonResponse(res, 200, rows);
  }

  return setJsonResponse(res, 404, { error: "Security route not found" });
}

async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  req.body = await parseJsonBody(req);
  const routeReq = findRoute(req);
  const route = routeReq.path;

  if (route.length === 0) {
    return setJsonResponse(res, 404, { error: "Route not found" });
  }

  if (route[0] === "health") {
    if (req.method !== "GET") {
      return setJsonResponse(res, 405, { error: "Method not allowed" });
    }
    try {
      const dbHealth = supabase
        ? await getSupabaseTableRows("big_members")
        : [];
      return setJsonResponse(res, 200, {
        status: "ok",
        database: supabase ? "connected" : "disabled",
        membersCount: Array.isArray(dbHealth) ? dbHealth.length : null,
      });
    } catch (err: any) {
      return setJsonResponse(res, 500, {
        error: err.message || "Health check failed",
      });
    }
  }

  if (route[0] === "auth") {
    return await handleAuthRoute(req, res, route);
  }
  if (route[0] === "security") {
    return await handleSecurityRoute(req, res, route);
  }
  if (route[0] === "email" && route[1] === "send") {
    return await handleEmailSend(req, res);
  }
  if (route[0] === "mpesa") {
    return await handleMpesa(req, res, route);
  }
  if (route[0] === "db") {
    if (req.method === "GET") return await handleGetDb(req, res);
    if (req.method === "POST" && route[1] === "sync")
      return await handleSyncDb(req, res);
    return setJsonResponse(res, 405, { error: "Method not allowed" });
  }
  if (route[0] === "members") {
    return await handleMembers(req, res);
  }
  if (route[0] === "posts") {
    return await handlePosts(req, res);
  }
  if (route[0] === "events") {
    return await handleEvents(req, res);
  }
  if (route[0] === "challenges") {
    return await handleChallenges(req, res);
  }
  if (route[0] === "conversations") {
    return await handleConversations(req, res);
  }
  if (route[0] === "mentorship-pairs") {
    return await handleMentorshipPairs(req, res);
  }
  if (route[0] === "forum-threads") {
    return await handleForumThreads(req, res);
  }
  if (route[0] === "circle-states") {
    return await handleCircleStates(req, res);
  }

  return setJsonResponse(res, 404, { error: "Route not handled by backend" });
}

export default handler;
