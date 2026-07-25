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

const LOCAL_DB_FILE = path.join(process.cwd(), "api", "_db.json");
const TMP_DB_FILE = path.join(os.tmpdir(), "_db.json");

function getActiveDbFilePath(): string {
  if (fs.existsSync(LOCAL_DB_FILE)) {
    return LOCAL_DB_FILE;
  }
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
    simulatedEmails: []
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
          .replace(/female1\.jpg/g, 'african_woman_portrait_1_1784708232425.jpg')
          .replace(/member-1\.png/g, 'african_woman_portrait_2_1784708246407.jpg')
          .replace(/member-2\.png/g, 'african_woman_portrait_3_1784708258772.jpg')
          .replace(/member-3\.png/g, 'african_woman_portrait_4_1784708270262.jpg');
      }

      const parsed = JSON.parse(raw);
      const defaults = getInitialState();
      
      // Seed missing hashes for initial members on startup so they have safe secure credentials
      let hashSeeded = false;
      if (Array.isArray(parsed.members)) {
        parsed.members = parsed.members.map((m: any) => {
          if (!m.passwordHash) {
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
      }

      const merged = {
        ...defaults,
        ...parsed
      };

      if (hashSeeded || needsCleanup || !parsed.campaigns) {
        fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2), "utf-8");
      }
      return merged;
    }
  } catch (err) {
    console.warn("Failed to load db.json, using seed data:", err);
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
  saveDb(defaultState);
  return defaultState;
};

export const saveDb = (state: ApplicationState): void => {
  try {
    const dbPath = getActiveDbFilePath();
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
    
    fs.writeFileSync(tempFile, data, "utf-8");
    fs.renameSync(tempFile, dbPath);
  } catch (err) {
    console.error("Failed to save db.json:", err);
  }
};

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

