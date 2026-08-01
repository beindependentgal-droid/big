import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { 
  INITIAL_MEMBERS, 
  INITIAL_POSTS, 
  INITIAL_EVENTS, 
  INITIAL_CHALLENGES, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MENTORSHIP_PAIRS,
  INITIAL_CAMPAIGNS,
  INITIAL_DONATIONS,
  INITIAL_MONTHLY_SUPPORTERS,
  INITIAL_IMPACT_STORIES,
  Member,
  Post,
  Event,
  Challenge,
  Conversation,
  MentorshipPair,
  Campaign,
  Donation,
  MonthlySupporter,
  ImpactStory,
  CircleRequest
} from "../src/data";

export const LOCAL_DB_FILE = path.resolve(process.cwd(), "api", "_db.json");
export const TMP_DB_FILE = path.join(os.tmpdir(), "_db.json");

// Detect an available writable directory on startup to avoid repeated failures
let DB_WRITEABLE_DIR: string | null = null;
function detectWritableDir() {
  try {
    const localDir = path.dirname(LOCAL_DB_FILE);
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    const testFile = path.join(localDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, "1");
    fs.unlinkSync(testFile);
    DB_WRITEABLE_DIR = localDir;
    return;
  } catch (e) {
    // fallthrough to tmp
  }

  try {
    const testFile = path.join(os.tmpdir(), `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, "1");
    fs.unlinkSync(testFile);
    DB_WRITEABLE_DIR = os.tmpdir();
    return;
  } catch (e) {
    DB_WRITEABLE_DIR = null;
  }
}

detectWritableDir();

function getWritableDbPath(): string {
  // Prefer local api/_db.json when writable, otherwise fall back to tmp dir
  if (DB_WRITEABLE_DIR === null) return TMP_DB_FILE;
  if (DB_WRITEABLE_DIR === path.dirname(LOCAL_DB_FILE)) return LOCAL_DB_FILE;
  return TMP_DB_FILE;
}

function getActiveDbFilePath(): string {
  // If a local file exists prefer it, otherwise try tmp. If neither is present we still return tmp.
  if (fs.existsSync(LOCAL_DB_FILE)) return LOCAL_DB_FILE;
  if (fs.existsSync(TMP_DB_FILE)) return TMP_DB_FILE;
  return TMP_DB_FILE;
}

export interface ForumThread {
  id: string;
  circleId: 'learn' | 'connect' | 'earn' | 'thrive';
  title: string;
  content: string;
  tag: 'Question' | 'Advice' | 'Collaboration' | 'Resource' | 'Struggle' | 'Idea' | 'Poll';
  author: {
    id: string;
    name: string;
    avatar: string;
    rank: string;
  };
  timestamp: string;
  likes: number;
  liked?: boolean;
  replies: any[];
  isPinned?: boolean;
  poll?: any;
}

// Production mode - no seed data, real data from users
const INITIAL_FORUM_THREADS: ForumThread[] = [];

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
  ip: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
}

export interface SentEmailLog {
  id: string;
  to: string;
  subject: string;
  status: string;
  provider: string;
  timestamp: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  topics: string[];
  subscribedAt: string;
  ip?: string;
}

export interface ApplicationState {
  members: Member[];
  posts: Post[];
  events: Event[];
  challenges: Challenge[];
  conversations: Conversation[];
  mentorshipPairs: MentorshipPair[];
  forumThreads: ForumThread[];
  circleStates: Record<string, { status: string; moderation: string }>;
  circleRequests: CircleRequest[];
  userPoints: number;
  userBadges: string[];
  followingIds: string[];
  bookmarkedPostIds: string[];
  academyProgress?: {
    enrolledCourseIds: string[];
    completedLessonIds: string[];
    lessonNotes: Record<string, string>;
    earnedCertificateIds: string[];
    activeCourseId: string | null;
    activeLessonId: string | null;
  };
  notifications: Array<{ id: string; title: string; read: boolean }>;
  campaigns: Campaign[];
  donations: Donation[];
  monthlySupporters: MonthlySupporter[];
  impactStories: ImpactStory[];
  auditLogs?: AuditLogEntry[];
  simulatedEmails?: SimulatedEmail[];
  sentEmailLogs?: SentEmailLog[];
  newsletterSubscribers?: NewsletterSubscriber[];
}

export const getInitialState = (): ApplicationState => {
  return {
    members: INITIAL_MEMBERS,
    posts: INITIAL_POSTS,
    events: INITIAL_EVENTS,
    challenges: INITIAL_CHALLENGES,
    conversations: INITIAL_CONVERSATIONS,
    mentorshipPairs: INITIAL_MENTORSHIP_PAIRS,
    forumThreads: INITIAL_FORUM_THREADS,
    circleStates: {},
    circleRequests: [],
    userPoints: 320,
    userBadges: ["confidence"],
    followingIds: ["m1", "m3"],
    bookmarkedPostIds: ["post-1"],
    academyProgress: {
      enrolledCourseIds: [],
      completedLessonIds: [],
      lessonNotes: {},
      earnedCertificateIds: [],
      activeCourseId: null,
      activeLessonId: null,
    },
    notifications: [
      { id: "not-0", title: "Welcome to Be Independent Gal platform! You currently have 320 points.", read: false }
    ],
    campaigns: INITIAL_CAMPAIGNS,
    donations: INITIAL_DONATIONS,
    monthlySupporters: INITIAL_MONTHLY_SUPPORTERS,
    impactStories: INITIAL_IMPACT_STORIES,
    auditLogs: [],
    simulatedEmails: [],
    newsletterSubscribers: []
  };
};

export const loadDb = (): ApplicationState => {
  try {
    const dbPath = getActiveDbFilePath();
    if (fs.existsSync(dbPath)) {
      let raw = fs.readFileSync(dbPath, "utf-8");
      
      // Check if any old/stale paths or files exist in the raw JSON
      const needsCleanup = raw.includes('src/assets/images/') || 
                            raw.includes('assets/images/') ||
                            raw.includes('female1.jpg') ||
                            raw.includes('member-1.png') ||
                            raw.includes('member-2.png') ||
                            raw.includes('member-3.png');
      
      if (needsCleanup) {
        raw = raw
          .replace(/\/public\/src\/assets\/images\//g, '/images/')
          .replace(/public\/src\/assets\/images\//g, '/images/')
          .replace(/\/src\/assets\/images\//g, '/images/')
          .replace(/src\/assets\/images\//g, '/images/')
          .replace(/\/assets\/images\//g, '/images/')
          .replace(/assets\/images\//g, '/images/')
          .replace(/female1\.jpg/g, 'african_woman_portrait.jpg')
          .replace(/member-1\.png/g, 'african_woman_portrait.jpg')
          .replace(/member-2\.png/g, 'african_woman_portrait.jpg')
          .replace(/member-3\.png/g, 'african_woman_portrait.jpg');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.error('Failed to parse DB JSON, will fallback to defaults. Error:', parseErr?.stack || parseErr);
        // move on to fallback behavior below
        throw parseErr;
      }
      const defaults = getInitialState();
      
      // Ensure default members are merged if missing, and every member has password salt & hash
      let existingMembers = Array.isArray(parsed.members) ? parsed.members : [];
      let hashSeeded = false;

      // Merge missing initial seed members
      if (Array.isArray(defaults.members)) {
        for (const defaultMember of defaults.members) {
          const found = existingMembers.find((m: any) => m.email?.toLowerCase() === defaultMember.email?.toLowerCase() || m.id === defaultMember.id);
          if (!found) {
            existingMembers.push(defaultMember);
            hashSeeded = true;
          }
        }
      }

      // Ensure every member has passwordHash and passwordSalt
      existingMembers = existingMembers.map((m: any) => {
        if (!m.passwordHash || !m.passwordSalt) {
          const salt = crypto.randomBytes(16).toString('hex');
          const hash = crypto.pbkdf2Sync('Password123!', salt, 10000, 64, 'sha512').toString('hex');
          m.passwordSalt = salt;
          m.passwordHash = hash;
          
          // Set default hashed PIN as well
          const pinSalt = crypto.randomBytes(16).toString('hex');
          const pinHash = crypto.pbkdf2Sync('123456', pinSalt, 10000, 64, 'sha512').toString('hex');
          m.pinSalt = pinSalt;
          m.pinHash = pinHash;
          hashSeeded = true;
        }
        return m;
      });

      parsed.members = existingMembers;

      const merged = {
        ...defaults,
        ...parsed
      };

      if (hashSeeded || needsCleanup || !parsed.campaigns) {
        try {
          fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2), "utf-8");
        } catch (writeErr) {
          console.error('Failed to write cleaned DB file:', writeErr?.stack || writeErr);
        }
      }
      return merged;
    }
  } catch (err) {
    console.warn("Failed to load db.json, using seed data:", err?.stack || err);
  }
  
  // Write default state to DB with freshly initialized hashes
  const defaultState = getInitialState();
  if (Array.isArray(defaultState.members)) {
    defaultState.members = defaultState.members.map((m: any) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync('Password123!', salt, 10000, 64, 'sha512').toString('hex');
      m.passwordSalt = salt;
      m.passwordHash = hash;

      const pinSalt = crypto.randomBytes(16).toString('hex');
      const pinHash = crypto.pbkdf2Sync('123456', pinSalt, 10000, 64, 'sha512').toString('hex');
      m.pinSalt = pinSalt;
      m.pinHash = pinHash;
      return m;
    });
  }
  // Attempt to persist default state; if persistence is not writable this will be skipped inside saveDb
  try {
    saveDb(defaultState);
  } catch (err) {
    console.error('saveDb threw while writing default state:', err?.stack || err);
  }
  return defaultState;
};

export const saveDb = (state: ApplicationState): boolean => {
  // If we detected earlier that no writable dir exists, skip writes to avoid repeated errors
  if (DB_WRITEABLE_DIR === null) {
    console.warn('Database write skipped: no writable filesystem available in this environment.');
    return false;
  }

  let dbPath = getWritableDbPath();
  try {
    const apiDir = path.dirname(dbPath);
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    // Global Safety: Cap arrays to prevent disk bloat
    if (state.auditLogs && state.auditLogs.length > 500) {
      state.auditLogs = state.auditLogs.slice(0, 500);
    }
    if (state.simulatedEmails && state.simulatedEmails.length > 100) {
      state.simulatedEmails = state.simulatedEmails.slice(0, 100);
    }
    if (state.notifications && state.notifications.length > 100) {
      state.notifications = state.notifications.slice(0, 100);
    }
    
    // Atomic write: write to temp file then rename to prevent corruption during crashes
    const tempFile = `${dbPath}.tmp`;
    const data = JSON.stringify(state, null, 2);
    
    try {
      fs.writeFileSync(tempFile, data, "utf-8");
      fs.renameSync(tempFile, dbPath);
      return true;
    } catch (err) {
      // Attempt fallback to tmp dir if we tried local first
      if (dbPath !== TMP_DB_FILE) {
        console.warn(`Local db write failed, retrying to tmp path: ${TMP_DB_FILE}`, err?.stack || err);
        dbPath = TMP_DB_FILE;
        const fallbackTempFile = `${dbPath}.tmp`;
        try {
          fs.writeFileSync(fallbackTempFile, data, "utf-8");
          fs.renameSync(fallbackTempFile, dbPath);
          return true;
        } catch (err2) {
          console.error('Fallback tmp write also failed:', err2?.stack || err2);
          return false;
        }
      } else {
        console.error('Failed to save db.json to tmp path:', err?.stack || err);
        return false;
      }
    }
  } catch (err) {
    console.error("Failed to save db.json:", err?.stack || err);
    return false;
  }
};

export function isDbWritable(): boolean {
  return DB_WRITEABLE_DIR !== null;
}

// Cryptographic Security Helper Functions
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function createSessionToken(userId: string, email: string): string {
  const payload = JSON.stringify({ userId, email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const base64Payload = Buffer.from(payload).toString('base64');
  const secret = process.env.SESSION_SECRET || 'big_sister_secure_signing_secret_2026';
  const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string): { userId: string; email: string } | null {
  try {
    const [base64Payload, signature] = token.split('.');
    if (!base64Payload || !signature) return null;
    const secret = process.env.SESSION_SECRET || 'big_sister_secure_signing_secret_2026';
    const expectedSignature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf-8'));
    if (Date.now() > payload.exp) return null; // Expired
    return { userId: payload.userId, email: payload.email };
  } catch (err) {
    return null;
  }
}

// Write entry to Audit Trail securely
export function writeAuditLog(userId: string, userEmail: string, action: string, ip: string): void {
  try {
    const db = loadDb();
    if (!db.auditLogs) {
      db.auditLogs = [];
    }
    const logEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      userId,
      userEmail,
      action,
      timestamp: new Date().toISOString(),
      ip
    };
    db.auditLogs.unshift(logEntry);
    saveDb(db);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

