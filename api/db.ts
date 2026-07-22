import fs from "fs";
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
  ImpactStory
} from "../src/data";

const DB_FILE = path.join(process.cwd(), "api", "db.json");

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

const INITIAL_FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread-learn-1',
    circleId: 'learn',
    title: 'How to apply for the BIG Academy Seed Grant for female micro-businesses?',
    content: 'Hello sisters! I am preparing my application for the upcoming BIG Academy Seed Grant cycle. Has anyone here successfully received it in previous cohorts? I would love to know what the selection committee prioritizes most. Is it the social impact story, our operational margins, or the digital innovation element? Any tips would mean the world! Thanks!',
    tag: 'Poll',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/images/female1.jpg',
      rank: 'Learner'
    },
    timestamp: 'Yesterday at 4:30 PM',
    likes: 18,
    liked: false,
    isPinned: true,
    poll: {
      question: 'Which element of the seed grant proposal is hardest for you to structure?',
      options: [
        { id: 'opt-1', text: 'Financial projections & allocation budgets', votes: 15 },
        { id: 'opt-2', text: 'Social impact narrative & story scaling', votes: 8 },
        { id: 'opt-3', text: 'Market sizing & competitor matrix', votes: 11 },
        { id: 'opt-4', text: 'Digital transformation or tech-enablement plan', votes: 5 }
      ],
      votedOptionIds: {
        'm2': 'opt-1',
        'm3': 'opt-1',
        'm4': 'opt-2',
        'm5': 'opt-3'
      }
    },
    replies: [
      {
        id: 'reply-l1-1',
        author: {
          id: 'm2',
          name: 'Fatima Adebayo',
          avatar: '/images/female1.jpg',
          rank: 'Mentor'
        },
        content: 'Amina, as someone who sat on the evaluation advisory last year, the most critical part is the Clarity of Fund Allocation. Tell us exactly how that seed grant acts as a catalyst (e.g. buying 1 specific manufacturing sewing machine or setting up an e-commerce gateway). Avoid generic claims like "using it for marketing". Be highly numerical!',
        timestamp: 'Yesterday at 6:15 PM',
        likes: 9,
        liked: false
      },
      {
        id: 'reply-l1-2',
        author: {
          id: 'm3',
          name: 'Hawa Keita',
          avatar: '/images/member-1.png',
          rank: 'Community Lead'
        },
        content: 'I agree with Fatima! When I applied, I detailed exactly how a 350,000 NGN grant would increase our textile dye batch volume by 40%. The judges loved the direct operational linkage. Keep it simple and focus on your core scaling milestone.',
        timestamp: 'Yesterday at 7:02 PM',
        likes: 6,
        liked: false
      }
    ]
  },
  {
    id: 'thread-learn-2',
    circleId: 'learn',
    title: 'Free practical guide on export rules under AfCFTA regulations',
    content: 'BIG Sisters, trade between our borders is becoming more open than ever! I have compiled a 10-page cheat sheet mapping out regional certificate of origin requirements under the AfCFTA framework. It specifically covers shipping garments and cosmetics between Kenya, Nigeria, and Ghana. Let me know if you would like me to email you the complete PDF!',
    tag: 'Resource',
    author: {
      id: 'm3',
      name: 'Hawa Keita',
      avatar: '/images/member-1.png',
      rank: 'Community Lead'
    },
    timestamp: '3 days ago',
    likes: 32,
    liked: false,
    replies: [
      {
        id: 'reply-l2-1',
        author: {
          id: 'm4',
          name: 'Joy Namubiru',
          avatar: '/images/member-2.png',
          rank: 'Member'
        },
        content: 'This is gold, Hawa! We are trying to distribute our organic shea butter balms from Kampala into Kenya but custom tariff codes are so confusing. Please count me in! My email is joy@organicshea.co.ug.',
        timestamp: '2 days ago',
        likes: 4,
        liked: false
      }
    ]
  },
  {
    id: 'thread-connect-1',
    circleId: 'connect',
    title: 'Looking for a technical co-founder with a Tech/AI background in West/East Africa',
    content: 'Hi sisters! I am scale-testing an organic cosmetics brand and we want to launch a simple AI-powered skincare advisor app that matches natural skin oil profiles to artisan formulation recipes. I have the entire cooperative supply chain locked down, but need a sister with React Native/Node.js or Python background to help lead tech. Let us hop on a virtual coffee chat!',
    tag: 'Collaboration',
    author: {
      id: 'm4',
      name: 'Joy Namubiru',
      avatar: '/images/member-2.png',
      rank: 'Member'
    },
    timestamp: '2 days ago',
    likes: 12,
    liked: false,
    replies: [
      {
        id: 'reply-c1-1',
        author: {
          id: 'm1',
          name: 'Amina Bello',
          avatar: '/images/female1.jpg',
          rank: 'Learner'
        },
        content: 'Wow, Joy! This sounds amazing. I have been building our local EdTech app with a solid React/Node.js stack and I also know two girls in my STEM academy who are incredibly proficient in building mobile apps. Let us connect via direct message so I can make the introductions.',
        timestamp: '2 days ago',
        likes: 5,
        liked: false
      }
    ]
  },
  {
    id: 'thread-connect-2',
    circleId: 'connect',
    title: 'Join our Bi-Weekly Business Goals Accountability Circle!',
    content: 'I find that working as a solo-founder can be incredibly isolating, making it easy to drop our weekly targets. I am setting up a micro-accountability circle of 5 sisters. We will meet on Zoom every other Saturday at 10 AM (EAT) for a quick, strict 20-minute standup: 1 win from the fortnight, 1 blockage, and 1 specific metric for the next two weeks. Drop a comment below if you want to commit!',
    tag: 'Advice',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/images/female1.jpg',
      rank: 'Mentor'
    },
    timestamp: '4 days ago',
    likes: 27,
    liked: false,
    replies: [
      {
        id: 'reply-c2-1',
        author: {
          id: 'you',
          name: 'Sarah Jenkins',
          avatar: '/images/member-1.png',
          rank: 'Learner'
        },
        content: 'Sister Fatima, I would love to join this circle! My main focus is launching my Lagos apparel checklist this month, and having your structured check-in will keep me totally focused. Count me in!',
        timestamp: '3 days ago',
        likes: 8,
        liked: true
      }
    ]
  },
  {
    id: 'thread-earn-1',
    circleId: 'earn',
    title: 'How to pitch your business story to international angel networks on a local budget',
    content: 'Sisters, global VC and angel investor groups are increasingly searching for genuine sustainable impact in Africa. But we do not need expensive PR agencies to get in front of them! In this thread, I am breaking down how I pitched my cooperative micro-finance model to European backers using a 10-slide deck, a 2-minute Loom screen share, and highly targeted LinkedIn outreach. Let us discuss what makes an investor response rates high.',
    tag: 'Advice',
    author: {
      id: 'm2',
      name: 'Fatima Adebayo',
      avatar: '/images/female1.jpg',
      rank: 'Mentor'
    },
    timestamp: '3 hours ago',
    likes: 45,
    liked: false,
    isPinned: true,
    replies: [
      {
        id: 'reply-e1-1',
        author: {
          id: 'm1',
          name: 'Amina Bello',
          avatar: '/images/female1.jpg',
          rank: 'Learner'
        },
        content: 'This breakdown is pure gold! The Loom recording trick is so smart because it builds personal trust instantly. They can see our passion, our voice, and our authenticity before they even schedule a calendar invite.',
        timestamp: '2 hours ago',
        likes: 12,
        liked: false
      }
    ]
  },
  {
    id: 'thread-thrive-1',
    circleId: 'thrive',
    title: 'Handling founder burnout, imposter feelings, and local retail friction',
    content: 'Yesterday was a very heavy day. I faced serious logistic issues with custom inspections and local transport, and it made me question if I was fit to lead this sustainable textile dream. How do you deal with the crushing weight of everything going wrong at once, especially when your peers think you have it all under control? Let us open up a raw, safe space in this thread.',
    tag: 'Struggle',
    author: {
      id: 'm1',
      name: 'Amina Bello',
      avatar: '/images/female1.jpg',
      rank: 'Learner'
    },
    timestamp: 'Yesterday',
    likes: 38,
    liked: false,
    replies: [
      {
        id: 'reply-t1-1',
        author: {
          id: 'm4',
          name: 'Joy Namubiru',
          avatar: '/images/member-2.png',
          rank: 'Member'
        },
        content: 'Amina, I am sending you a warm virtual hug. Last week, we lost a whole cargo batch of glass cosmetic bottles to accidental damage. I cried for hours. But I realized that our resilience is not about not crying; it is about washing our face and letting ourselves start again. You are not alone, sister.',
        timestamp: 'Yesterday at 8:15 PM',
        likes: 14,
        liked: false
      },
      {
        id: 'reply-t1-2',
        author: {
          id: 'm2',
          name: 'Fatima Adebayo',
          avatar: '/images/female1.jpg',
          rank: 'Mentor'
        },
        content: 'Beautifully said Joy. Amina, please remember that custom officers and transit delays are external noise—they do not define your internal capabilities. Take a 24-hour digital detox. Your vision is worth the brief pause.',
        timestamp: 'Today at 6:40 AM',
        likes: 10,
        liked: false
      }
    ]
  }
];

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
  userPoints: number;
  userBadges: string[];
  followingIds: string[];
  bookmarkedPostIds: string[];
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
    userPoints: 320,
    userBadges: ["confidence"],
    followingIds: ["m1", "m3"],
    bookmarkedPostIds: ["post-1"],
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
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
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

      if (hashSeeded || !parsed.campaigns) {
        fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2), "utf-8");
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
    const apiDir = path.dirname(DB_FILE);
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
    const tempFile = `${DB_FILE}.tmp`;
    const data = JSON.stringify(state, null, 2);
    
    fs.writeFileSync(tempFile, data, "utf-8");
    fs.renameSync(tempFile, DB_FILE);
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

