import { Member, Post, Event, Challenge, Conversation, MentorshipPair, Circle, CircleRequest, Campaign, Donation, MonthlySupporter, ImpactStory } from './data';

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

export interface FullBackendState {
  members: Member[];
  posts: Post[];
  events: Event[];
  challenges: Challenge[];
  conversations: Conversation[];
  mentorshipPairs: MentorshipPair[];
  forumThreads: ForumThread[];
  circles: Circle[];
  circleRequests: CircleRequest[];
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
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const token = localStorage.getItem('big_v2_session_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {
  // Load entire unified backend database state
  async getFullState(): Promise<FullBackendState> {
    const res = await fetch('/api/db');
    if (!res.ok) throw new Error('Failed to load database from server');
    return res.json();
  },

  // Save/Sync state sections securely
  async syncState(partialState: Partial<FullBackendState>): Promise<FullBackendState> {
    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(partialState)
    });
    if (!res.ok) throw new Error('Failed to sync state to server');
    const data = await res.json();
    return data.state;
  },

  // Granular updates (with token protection)
  async saveMembers(members: Member[]): Promise<Member[]> {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(members)
    });
    return res.json();
  },

  async saveMember(member: Member): Promise<Member[]> {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(member)
    });
    return res.json();
  },

  async savePosts(posts: Post[]): Promise<Post[]> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(posts)
    });
    return res.json();
  },

  async savePost(post: Post): Promise<Post[]> {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(post)
    });
    return res.json();
  },

  async saveEvents(events: Event[]): Promise<Event[]> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(events)
    });
    return res.json();
  },

  async saveEvent(event: Event): Promise<Event[]> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(event)
    });
    return res.json();
  },

  async saveChallenges(challenges: Challenge[]): Promise<Challenge[]> {
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(challenges)
    });
    return res.json();
  },

  async saveConversations(conversations: Conversation[]): Promise<Conversation[]> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(conversations)
    });
    return res.json();
  },

  async saveMentorshipPairs(pairs: MentorshipPair[]): Promise<MentorshipPair[]> {
    const res = await fetch('/api/mentorship-pairs', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(pairs)
    });
    return res.json();
  },

  async saveForumThreads(threads: ForumThread[]): Promise<ForumThread[]> {
    const res = await fetch('/api/forum-threads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(threads)
    });
    return res.json();
  },

  async saveCircleStates(states: Record<string, { status: string; moderation: string }>): Promise<any> {
    const res = await fetch('/api/circle-states', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(states)
    });
    return res.json();
  },

  // ---------------- AUTHENTICATION & SECURITY ENDPOINTS ----------------

  // Register new account securely (supports optional biometric credential ID)
  async register(name: string, email: string, password: string, biometricCredentialId?: string): Promise<{ token: string; user: Member }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, biometricCredentialId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // Enroll biometrics for an already-authenticated session
  async biometricEnroll(biometricCredentialId: string): Promise<{ success: boolean; user: Member }> {
    const res = await fetch('/api/auth/biometric-enroll', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ biometricCredentialId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Biometric enrollment failed');
    }
    return res.json();
  },

  // Login via biometric handshake
  async biometricLogin(email: string, biometricCredentialId: string): Promise<{ token: string; user: Member }> {
    const res = await fetch('/api/auth/biometric-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, biometricCredentialId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Biometric login failed');
    }
    return res.json();
  },

  // Login securely
  async login(email: string, password: string): Promise<{ token: string; user: Member }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  // Verify stored session token
  async verifySession(): Promise<{ valid: boolean; user: Member }> {
    const res = await fetch('/api/auth/verify-session', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Session is invalid or expired');
    return res.json();
  },

  // Request true server-side OTP
  async requestOtp(email: string, actionName: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, actionName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dispatch code');
    }
    return res.json();
  },

  // Verify true server-side OTP
  async verifyOtp(email: string, code: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid code');
    }
    return res.json();
  },

  // Set Security PIN securely on the server
  async setPin(pin: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/security/set-pin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update PIN');
    }
    return res.json();
  },

  // Verify Security PIN securely on the server
  async verifyPin(pin: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/security/verify-pin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ pin })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Verification failed');
    }
    return res.json();
  },

  // Load audit logs for the current session
  async getAuditLogs(): Promise<any[]> {
    const res = await fetch('/api/security/audit-logs', {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to retrieve audit trail');
    return res.json();
  },

  // Check Resend email service status & dispatch logs
  async getEmailStatus(): Promise<{
    isConfigured: boolean;
    fromEmail: string;
    sentEmailLogs: Array<{
      id: string;
      to: string;
      subject: string;
      status: string;
      provider: string;
      timestamp: number;
    }>;
  }> {
    const res = await fetch('/api/email/status');
    if (!res.ok) throw new Error('Failed to load email service status');
    return res.json();
  },

  // Dispatch real email via Resend
  async sendEmail(params: {
    to: string;
    subject: string;
    body?: string;
    template?: 'receipt' | 'welcome' | 'otp' | 'grant_update' | 'general';
    donorName?: string;
    campaignTitle?: string;
    amount?: number;
    receiptNumber?: string;
  }): Promise<{ success: boolean; requiresApiKey?: boolean; emailId?: string; message: string; provider?: string }> {
    const res = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch email');
    }
    return data;
  },

  // ---------------- M-PESA STK PUSH API HELPERS ----------------

  // Initiate M-Pesa STK Push
  async initiateMpesaStkPush(params: {
    phoneNumber: string;
    amount: number;
    accountReference?: string;
    campaignTitle?: string;
    donorName?: string;
    donorEmail?: string;
    isAnonymous?: boolean;
    isMonthly?: boolean;
  }): Promise<{ success: boolean; mode: string; checkoutRequestId: string; merchantRequestId: string; customerMessage: string }> {
    const res = await fetch('/api/mpesa/stkpush', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to dispatch M-Pesa STK Push');
    }
    return res.json();
  },

  // Confirm simulated STK Push PIN
  async confirmSimulatedMpesaStkPush(checkoutRequestId: string, pin: string): Promise<{ success: boolean; receiptNumber: string; message: string }> {
    const res = await fetch('/api/mpesa/stkpush/simulate-confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkoutRequestId, pin })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'STK Push authorization rejected');
    }
    return res.json();
  },

  // Query STK Push status
  async queryMpesaStkPushStatus(checkoutRequestId: string): Promise<{ checkoutRequestId: string; status: string; amount: number; phoneNumber: string; mpesaReceiptNumber?: string; resultDesc?: string }> {
    const res = await fetch(`/api/mpesa/stkpush/query/${checkoutRequestId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to query STK Push status');
    }
    return res.json();
  }
};

