import { createClient } from '@supabase/supabase-js';
import { 
  Member, 
  Post, 
  Event, 
  Challenge, 
  Conversation, 
  MentorshipPair,
  INITIAL_MEMBERS,
  INITIAL_POSTS,
  INITIAL_EVENTS,
  INITIAL_CHALLENGES,
  INITIAL_CONVERSATIONS,
  INITIAL_MENTORSHIP_PAIRS
} from './data';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublicKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let globalSupabaseBroken = false;
let globalTablesMissing = false;

export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabasePublicKey &&
    supabaseUrl.startsWith('http') &&
    !globalSupabaseBroken &&
    !globalTablesMissing
  );
};

// Create the client with the public Supabase key (publishable or anon) only.
// This should use the browser-safe key and avoid sending local app session tokens here.
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabasePublicKey)
  : null;

export const areTablesMissing = () => globalTablesMissing;

function handleSupabaseError(context: string, error: any) {
  if (!error) return;
  const errMsg = error.message || (typeof error === 'string' ? error : '');
  const errDetails = error.details || '';
  const errCode = error.code || '';

  const isMissingTable = 
    errMsg.includes('Could not find the table') ||
    errMsg.includes('does not exist') ||
    errDetails.includes('does not exist') ||
    errCode === 'PGRST116' ||
    errCode === '42P01';

  const isMissingColumn =
    errMsg.includes("Could not find the '") && errMsg.includes("' column") ||
    errMsg.includes('column') && errMsg.includes('schema cache') ||
    errCode === '42703';

  const isInvalidCredentials =
    errMsg.toLowerCase().includes('invalid api key') ||
    errMsg.toLowerCase().includes('invalid key') ||
    errMsg.toLowerCase().includes('unauthorized') ||
    errMsg.toLowerCase().includes('401') ||
    errCode === '401' ||
    errCode === 'invalid_api_key';

  if (isMissingTable || isMissingColumn) {
    globalTablesMissing = true;
    globalSupabaseBroken = true;
    console.warn(`[Supabase Status] Supabase schema is missing expected tables/columns. Setup is required via SQL. (${context})`);
  } else if (isInvalidCredentials) {
    globalSupabaseBroken = true;
    console.warn(`[Supabase Status] Invalid Supabase credentials or unauthorized access detected. Falling back to local storage. (${context})`);
  } else {
    // Normal error, log gently
    console.warn(`[Supabase Warning] ${context}:`, errMsg || errDetails || errCode);
  }
}

const supabaseSeedState = {
  members: { running: false, done: false },
  events: { running: false, done: false }
};

function cleanMemberForDb(member: Member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email ?? null,
    avatar: member.avatar,
    title: member.title,
    city: member.city,
    rank: member.rank,
    skills: member.skills ?? [],
    interests: member.interests ?? [],
    bio: member.bio,
    points: member.points ?? 0,
    badges: member.badges ?? [],
    business_stage: member.business_stage ?? null,
    mentoring_capacity: member.mentoring_capacity ?? null,
    followingIds: member.followingIds ?? [],
    followerIds: member.followerIds ?? [],
    circleIds: member.circleIds ?? [],
    isSuperAdmin: member.isSuperAdmin ?? false,
    isModerator: member.isModerator ?? false,
    joinedAt: member.joinedAt ?? null,
    website: member.website ?? null,
    linkedinUrl: member.linkedinUrl ?? null,
    githubUrl: member.githubUrl ?? null,
    twitterUrl: member.twitterUrl ?? null,
    company: member.company ?? null,
    industry: member.industry ?? null,
    certifications: member.certifications ?? [],
    endorsements: member.endorsements ?? [],
    recommendations: member.recommendations ?? [],
    experience: member.experience ?? [],
    education: member.education ?? [],
    biometricCredentialId: member.biometricCredentialId ?? null,
    passwordHash: member.passwordHash ?? null,
    passwordSalt: member.passwordSalt ?? null,
    pinHash: member.pinHash ?? null,
    pinSalt: member.pinSalt ?? null
  };
}

function cleanEventForDb(event: Event) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    type: event.type,
    attendees: event.attendees ?? 0,
    attendeeNames: event.attendeeNames ?? [],
    rsvped: event.rsvped ?? false,
    description: event.description,
    image: event.image ?? null,
    category: event.category ?? null,
    reminded: event.reminded ?? false,
    createdBy: event.createdBy ?? null
  };
}

/**
 * Robust Supabase Sync Helper
 * Supports fallback to localStorage when Supabase is not configured or fails.
 */
export const supabaseService = {
  // 1. Members
  async getMembers(): Promise<Member[]> {
    if (!supabase || globalTablesMissing) return JSON.parse(localStorage.getItem('big_v2_members') || 'null') || INITIAL_MEMBERS;
    try {
      const { data, error } = await supabase
        .from('big_members')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) {
        handleSupabaseError('getMembers select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        // Seed if empty
        await this.seedMembers(INITIAL_MEMBERS);
        return INITIAL_MEMBERS;
      }
      return data as Member[];
    } catch (e: any) {
      handleSupabaseError('getMembers catch', e);
      return JSON.parse(localStorage.getItem('big_v2_members') || 'null') || INITIAL_MEMBERS;
    }
  },

  async seedMembers(members: Member[]) {
    if (!supabase || globalTablesMissing || supabaseSeedState.members.done || supabaseSeedState.members.running) return;
    supabaseSeedState.members.running = true;
    try {
      const mappedMembers = members.map(cleanMemberForDb);
      const { error } = await supabase.from('big_members').upsert(mappedMembers, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedMembers', error);
      } else {
        supabaseSeedState.members.done = true;
      }
    } catch (e: any) {
      handleSupabaseError('seedMembers catch', e);
    } finally {
      supabaseSeedState.members.running = false;
    }
  },

  async saveMember(member: Member) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_members').upsert(cleanMemberForDb(member), { onConflict: 'id' });
      if (error) {
        handleSupabaseError('saveMember', error);
      }
    } catch (e: any) {
      handleSupabaseError('saveMember catch', e);
    }
  },

  // 2. Posts & Feed
  async getPosts(): Promise<Post[]> {
    if (!supabase || globalTablesMissing) return JSON.parse(localStorage.getItem('big_v2_posts') || 'null') || INITIAL_POSTS;
    try {
      const { data, error } = await supabase
        .from('big_posts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        handleSupabaseError('getPosts select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        await this.seedPosts(INITIAL_POSTS);
        return INITIAL_POSTS;
      }
      
      // Safe conversion for likes from DB to Post[]
      return (data as any[]).map(p => ({
        ...p,
        likes: Array.isArray(p.likes_ids)
          ? p.likes_ids
          : (typeof p.likes === 'number'
              ? Array.from({ length: p.likes }, (_, i) => `user-mock-${i}`)
              : Array.isArray(p.likes) ? p.likes : [])
      })) as Post[];
    } catch (e: any) {
      handleSupabaseError('getPosts catch', e);
      return JSON.parse(localStorage.getItem('big_v2_posts') || 'null') || INITIAL_POSTS;
    }
  },

  async seedPosts(posts: Post[]) {
    if (!supabase || globalTablesMissing) return;
    try {
      const mappedPosts = posts.map(post => {
        const currentLikes = Array.isArray(post.likes) ? post.likes : [];
        return {
          ...post,
          likes: currentLikes.length as any, // Send integer length for DB schema compatibility
          likes_ids: currentLikes
        };
      });
      const { error } = await supabase.from('big_posts').upsert(mappedPosts, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedPosts', error);
      }
    } catch (e: any) {
      handleSupabaseError('seedPosts catch', e);
    }
  },

  async savePost(post: Post) {
    if (!supabase || globalTablesMissing) return;
    try {
      const currentLikes = Array.isArray(post.likes) ? post.likes : [];
      const mappedPost = {
        ...post,
        likes: currentLikes.length as any, // Send integer length for DB schema compatibility
        likes_ids: currentLikes
      };
      const { error } = await supabase.from('big_posts').upsert(mappedPost, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('savePost', error);
      }
    } catch (e: any) {
      handleSupabaseError('savePost catch', e);
    }
  },

  // 3. Events
  async getEvents(): Promise<Event[]> {
    if (!supabase || globalTablesMissing) return JSON.parse(localStorage.getItem('big_v2_events') || 'null') || INITIAL_EVENTS;
    try {
      const { data, error } = await supabase
        .from('big_events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        handleSupabaseError('getEvents select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        await this.seedEvents(INITIAL_EVENTS);
        return INITIAL_EVENTS;
      }
      return data as Event[];
    } catch (e: any) {
      handleSupabaseError('getEvents catch', e);
      return JSON.parse(localStorage.getItem('big_v2_events') || 'null') || INITIAL_EVENTS;
    }
  },

  async seedEvents(events: Event[]) {
    if (!supabase || globalTablesMissing || supabaseSeedState.events.done || supabaseSeedState.events.running) return;
    supabaseSeedState.events.running = true;
    try {
      const mappedEvents = events.map(cleanEventForDb);
      const { error } = await supabase.from('big_events').upsert(mappedEvents, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedEvents', error);
      } else {
        supabaseSeedState.events.done = true;
      }
    } catch (e: any) {
      handleSupabaseError('seedEvents catch', e);
    } finally {
      supabaseSeedState.events.running = false;
    }
  },

  async saveEvent(event: Event) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_events').upsert(cleanEventForDb(event), { onConflict: 'id' });
      if (error) {
        handleSupabaseError('saveEvent', error);
      }
    } catch (e: any) {
      handleSupabaseError('saveEvent catch', e);
    }
  },

  // 4. Challenges
  async getChallenges(): Promise<Challenge[]> {
    if (!supabase || globalTablesMissing) return JSON.parse(localStorage.getItem('big_v2_challenges') || 'null') || INITIAL_CHALLENGES;
    try {
      const { data, error } = await supabase
        .from('big_challenges')
        .select('*');

      if (error) {
        handleSupabaseError('getChallenges select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        await this.seedChallenges(INITIAL_CHALLENGES);
        return INITIAL_CHALLENGES;
      }
      return data as Challenge[];
    } catch (e: any) {
      handleSupabaseError('getChallenges catch', e);
      return JSON.parse(localStorage.getItem('big_v2_challenges') || 'null') || INITIAL_CHALLENGES;
    }
  },

  async seedChallenges(challenges: Challenge[]) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_challenges').upsert(challenges, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedChallenges', error);
      }
    } catch (e: any) {
      handleSupabaseError('seedChallenges catch', e);
    }
  },

  async saveChallenge(challenge: Challenge) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_challenges').upsert(challenge, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('saveChallenge', error);
      }
    } catch (e: any) {
      handleSupabaseError('saveChallenge catch', e);
    }
  },

  // 5. Conversations
  async getConversations(): Promise<Conversation[]> {
    if (!supabase || globalTablesMissing) return JSON.parse(localStorage.getItem('big_v2_conversations') || 'null') || INITIAL_CONVERSATIONS;
    try {
      const { data, error } = await supabase
        .from('big_conversations')
        .select('*');

      if (error) {
        handleSupabaseError('getConversations select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        await this.seedConversations(INITIAL_CONVERSATIONS);
        return INITIAL_CONVERSATIONS;
      }
      return data as Conversation[];
    } catch (e: any) {
      handleSupabaseError('getConversations catch', e);
      return JSON.parse(localStorage.getItem('big_v2_conversations') || 'null') || INITIAL_CONVERSATIONS;
    }
  },

  async seedConversations(conversations: Conversation[]) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_conversations').upsert(conversations, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedConversations', error);
      }
    } catch (e: any) {
      handleSupabaseError('seedConversations catch', e);
    }
  },

  async saveConversation(conv: Conversation) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_conversations').upsert(conv, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('saveConversation', error);
      }
    } catch (e: any) {
      handleSupabaseError('saveConversation catch', e);
    }
  },

  // 6. Mentorship Pairs
  async getMentorshipPairs(): Promise<MentorshipPair[]> {
    if (!supabase || globalTablesMissing) return INITIAL_MENTORSHIP_PAIRS;
    try {
      const { data, error } = await supabase
        .from('big_mentorship_pairs')
        .select('*');

      if (error) {
        handleSupabaseError('getMentorshipPairs select', error);
        throw error;
      }
      if (!data || data.length === 0) {
        await this.seedMentorshipPairs(INITIAL_MENTORSHIP_PAIRS);
        return INITIAL_MENTORSHIP_PAIRS;
      }
      return data as MentorshipPair[];
    } catch (e: any) {
      handleSupabaseError('getMentorshipPairs catch', e);
      return JSON.parse(localStorage.getItem('big_v2_mentorship_pairs') || 'null') || INITIAL_MENTORSHIP_PAIRS;
    }
  },

  async seedMentorshipPairs(pairs: MentorshipPair[]) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_mentorship_pairs').upsert(pairs, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('seedMentorshipPairs', error);
      }
    } catch (e: any) {
      handleSupabaseError('seedMentorshipPairs catch', e);
    }
  },

  async saveMentorshipPair(pair: MentorshipPair) {
    if (!supabase || globalTablesMissing) return;
    try {
      const { error } = await supabase.from('big_mentorship_pairs').upsert(pair, { onConflict: 'id' });
      if (error) {
        handleSupabaseError('saveMentorshipPair', error);
      }
    } catch (e: any) {
      handleSupabaseError('saveMentorshipPair catch', e);
    }
  },

  // 7. Storage - Avatar Upload
  async uploadAvatar(file: File): Promise<string> {
    if (!supabase || globalTablesMissing) {
      throw new Error('Supabase is not connected or tables are missing.');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `you-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload the file to the 'avatars' bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!data || !data.publicUrl) {
      throw new Error('Could not retrieve public URL for uploaded file.');
    }

    return data.publicUrl;
  },

  // Full structural DB initialization query instructions for user to copy-paste into Supabase SQL Editor
  getSupabaseSQLSetup() {
    return `-- Run this in your Supabase SQL Editor to prepare your tables!

-- 1. Create table for Members
create table if not exists big_members (
  id text primary key,
  name text not null,
  email text,
  avatar text,
  title text,
  city text,
  rank text,
  skills text[],
  interests text[],
  bio text,
  points integer default 0,
  badges text[],
  business_stage text,
  mentoring_capacity text,
  "followingIds" text[] default '{}'::text[],
  "followerIds" text[] default '{}'::text[],
  "circleIds" text[] default '{}'::text[],
  isSuperAdmin boolean default false,
  isModerator boolean default false,
  joinedAt text,
  website text,
  linkedinUrl text,
  githubUrl text,
  twitterUrl text,
  company text,
  industry text,
  certifications text[] default '{}'::text[],
  endorsements jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  education jsonb default '[]'::jsonb,
  biometricCredentialId text,
  passwordHash text,
  passwordSalt text,
  pinHash text,
  pinSalt text
);

-- 2. Create table for Posts
create table if not exists big_posts (
  id text primary key,
  author jsonb not null,
  content text not null,
  timestamp text not null,
  likes integer default 0,
  "likes_ids" jsonb default '[]'::jsonb,
  comments jsonb default '[]'::jsonb,
  liked boolean default false,
  "circleId" text,
  tag text,
  tags text[] default '{}'::text[],
  imageUrl text,
  reactions jsonb default '[]'::jsonb,
  commentsDisabled boolean default false,
  repostsCount integer default 0,
  sharesCount integer default 0,
  scheduledFor text,
  status text
);

-- 3. Create table for Events
create table if not exists big_events (
  id text primary key,
  title text not null,
  date text,
  time text,
  location text,
  type text,
  attendees integer default 0,
  attendeeNames text[] default '{}'::text[],
  rsvped boolean default false,
  description text,
  image text,
  category text,
  reminded boolean default false,
  createdBy text
);

-- 4. Create table for Challenges
create table if not exists big_challenges (
  id text primary key,
  title text not null,
  description text,
  reward text,
  progress integer default 0,
  completed boolean default false,
  badge text,
  category text,
  target text
);

-- 5. Create table for Conversations
create table if not exists big_conversations (
  id text primary key,
  member jsonb not null,
  messages jsonb default '[]'::jsonb,
  unread boolean default false
);

-- 6. Create table for Mentorship Pairs
create table if not exists big_mentorship_pairs (
  id text primary key,
  mentor jsonb not null,
  mentee jsonb not null,
  topic text,
  status text,
  "startDate" text
);

-- Ensure existing tables have all current app columns so old installs can migrate safely
-- Members
alter table if exists big_members add column if not exists email text;
alter table if exists big_members add column if not exists avatar text;
alter table if exists big_members add column if not exists title text;
alter table if exists big_members add column if not exists city text;
alter table if exists big_members add column if not exists rank text;
alter table if exists big_members add column if not exists skills text[] default '{}'::text[];
alter table if exists big_members add column if not exists interests text[] default '{}'::text[];
alter table if exists big_members add column if not exists bio text;
alter table if exists big_members add column if not exists points integer default 0;
alter table if exists big_members add column if not exists badges text[] default '{}'::text[];
alter table if exists big_members add column if not exists business_stage text;
alter table if exists big_members add column if not exists mentoring_capacity text;
alter table if exists big_members add column if not exists "followingIds" text[] default '{}'::text[];
alter table if exists big_members add column if not exists "followerIds" text[] default '{}'::text[];
alter table if exists big_members add column if not exists "circleIds" text[] default '{}'::text[];
alter table if exists big_members add column if not exists isSuperAdmin boolean default false;
alter table if exists big_members add column if not exists isModerator boolean default false;
alter table if exists big_members add column if not exists joinedAt text;
alter table if exists big_members add column if not exists website text;
alter table if exists big_members add column if not exists linkedinUrl text;
alter table if exists big_members add column if not exists githubUrl text;
alter table if exists big_members add column if not exists twitterUrl text;
alter table if exists big_members add column if not exists company text;
alter table if exists big_members add column if not exists industry text;
alter table if exists big_members add column if not exists certifications text[] default '{}'::text[];
alter table if exists big_members add column if not exists endorsements jsonb default '[]'::jsonb;
alter table if exists big_members add column if not exists recommendations jsonb default '[]'::jsonb;
alter table if exists big_members add column if not exists experience jsonb default '[]'::jsonb;
alter table if exists big_members add column if not exists education jsonb default '[]'::jsonb;
alter table if exists big_members add column if not exists biometricCredentialId text;
alter table if exists big_members add column if not exists passwordHash text;
alter table if exists big_members add column if not exists passwordSalt text;
alter table if exists big_members add column if not exists pinHash text;
alter table if exists big_members add column if not exists pinSalt text;

-- Posts
alter table if exists big_posts add column if not exists author jsonb;
alter table if exists big_posts add column if not exists content text;
alter table if exists big_posts add column if not exists timestamp text;
alter table if exists big_posts add column if not exists likes integer default 0;
alter table if exists big_posts add column if not exists "likes_ids" jsonb default '[]'::jsonb;
alter table if exists big_posts add column if not exists comments jsonb default '[]'::jsonb;
alter table if exists big_posts add column if not exists liked boolean default false;
alter table if exists big_posts add column if not exists "circleId" text;
alter table if exists big_posts add column if not exists tag text;
alter table if exists big_posts add column if not exists tags text[] default '{}'::text[];
alter table if exists big_posts add column if not exists imageUrl text;
alter table if exists big_posts add column if not exists reactions jsonb default '[]'::jsonb;
alter table if exists big_posts add column if not exists commentsDisabled boolean default false;
alter table if exists big_posts add column if not exists repostsCount integer default 0;
alter table if exists big_posts add column if not exists sharesCount integer default 0;
alter table if exists big_posts add column if not exists scheduledFor text;
alter table if exists big_posts add column if not exists status text;

-- Events
alter table if exists big_events add column if not exists date text;
alter table if exists big_events add column if not exists time text;
alter table if exists big_events add column if not exists location text;
alter table if exists big_events add column if not exists type text;
alter table if exists big_events add column if not exists attendees integer default 0;
alter table if exists big_events add column if not exists attendeeNames text[] default '{}'::text[];
alter table if exists big_events add column if not exists rsvped boolean default false;
alter table if exists big_events add column if not exists description text;
alter table if exists big_events add column if not exists image text;
alter table if exists big_events add column if not exists category text;
alter table if exists big_events add column if not exists reminded boolean default false;
alter table if exists big_events add column if not exists createdBy text;

-- Challenges
alter table if exists big_challenges add column if not exists title text;
alter table if exists big_challenges add column if not exists description text;
alter table if exists big_challenges add column if not exists reward text;
alter table if exists big_challenges add column if not exists progress integer default 0;
alter table if exists big_challenges add column if not exists completed boolean default false;
alter table if exists big_challenges add column if not exists badge text;
alter table if exists big_challenges add column if not exists category text;
alter table if exists big_challenges add column if not exists target text;

-- Conversations
alter table if exists big_conversations add column if not exists member jsonb;
alter table if exists big_conversations add column if not exists messages jsonb default '[]'::jsonb;
alter table if exists big_conversations add column if not exists unread boolean default false;

-- Mentorship Pairs
alter table if exists big_mentorship_pairs add column if not exists mentor jsonb;
alter table if exists big_mentorship_pairs add column if not exists mentee jsonb;
alter table if exists big_mentorship_pairs add column if not exists topic text;
alter table if exists big_mentorship_pairs add column if not exists status text;
alter table if exists big_mentorship_pairs add column if not exists "startDate" text;

-- Enable Row Level Security (optional, for production write access configure rules appropriately)
alter table big_members enable row level security;
alter table big_posts enable row level security;
alter table big_events enable row level security;
alter table big_challenges enable row level security;
alter table big_conversations enable row level security;
alter table big_mentorship_pairs enable row level security;

-- 7. Secure Token Extractor Helper function for Custom JWT Authentication Integration
create or replace function get_auth_user_id()
returns text as $$
declare
  auth_header text;
  jwt_token text;
  parts text[];
  payload_json jsonb;
begin
  auth_header := current_setting('request.headers', true)::json->>'authorization';
  if auth_header is null then
    return null;
  end if;
  
  jwt_token := substring(auth_header from 'Bearer\\s+(.+)');
  if jwt_token is null then
    return null;
  end if;
  
  parts := string_to_array(jwt_token, '.');
  if array_length(parts, 1) < 2 then
    return null;
  end if;
  
  begin
    payload_json := convert_from(decode(parts[1], 'base64'), 'UTF8')::jsonb;
    return payload_json->>'userId';
  exception when others then
    return null;
  end;
end;
$$ language plpgsql security definer;

-- Create bulletproof policies for Members (isolation)
drop policy if exists "Allow select for authenticated" on big_members;
drop policy if exists "Allow update/delete for profile owner" on big_members;
drop policy if exists "Allow public read access" on big_members;
drop policy if exists "Allow public insert/update" on big_members;

create policy "Allow select for authenticated" on big_members 
  for select using (get_auth_user_id() is not null);

create policy "Allow update/delete for profile owner" on big_members 
  for all using (get_auth_user_id() = id) with check (get_auth_user_id() = id);

-- Create bulletproof policies for Posts (isolation)
drop policy if exists "Allow select for authenticated" on big_posts;
drop policy if exists "Allow write for post author" on big_posts;
drop policy if exists "Allow public read access" on big_posts;
drop policy if exists "Allow public insert/update" on big_posts;

create policy "Allow select for authenticated" on big_posts 
  for select using (get_auth_user_id() is not null);

create policy "Allow write for post author" on big_posts 
  for all using (get_auth_user_id() = author->>'id') with check (get_auth_user_id() = author->>'id');

-- Create bulletproof policies for Events
drop policy if exists "Allow select for authenticated" on big_events;
drop policy if exists "Allow update for authenticated" on big_events;
drop policy if exists "Allow public read access" on big_events;
drop policy if exists "Allow public insert/update" on big_events;

create policy "Allow select for authenticated" on big_events 
  for select using (get_auth_user_id() is not null);

create policy "Allow update for authenticated" on big_events 
  for update using (get_auth_user_id() is not null);

-- Create bulletproof policies for Challenges
drop policy if exists "Allow select for authenticated" on big_challenges;
drop policy if exists "Allow update for authenticated" on big_challenges;
drop policy if exists "Allow public read access" on big_challenges;
drop policy if exists "Allow public insert/update" on big_challenges;

create policy "Allow select for authenticated" on big_challenges 
  for select using (get_auth_user_id() is not null);

create policy "Allow update for authenticated" on big_challenges 
  for update using (get_auth_user_id() is not null);

-- Create bulletproof policies for Conversations (isolation)
drop policy if exists "Allow select/write for conversation member" on big_conversations;
drop policy if exists "Allow public read access" on big_conversations;
drop policy if exists "Allow public insert/update" on big_conversations;

create policy "Allow select/write for conversation member" on big_conversations 
  for all using (get_auth_user_id() = member->>'id') with check (get_auth_user_id() = member->>'id');

-- Create bulletproof policies for Mentorship Pairs (isolation)
drop policy if exists "Allow select/write for mentorship participants" on big_mentorship_pairs;
drop policy if exists "Allow public read access" on big_mentorship_pairs;
drop policy if exists "Allow public insert/update" on big_mentorship_pairs;

create policy "Allow select/write for mentorship participants" on big_mentorship_pairs 
  for all using (get_auth_user_id() = mentor->>'id' or get_auth_user_id() = mentee->>'id') 
  with check (get_auth_user_id() = mentor->>'id' or get_auth_user_id() = mentee->>'id');

-- Create a storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true) 
on conflict (id) do nothing;

-- Create policies for storage
drop policy if exists "Allow public read access to avatars" on storage.objects;
drop policy if exists "Allow public insert/update to avatars" on storage.objects;

create policy "Allow public read access to avatars" 
  on storage.objects for select 
  using (bucket_id = 'avatars');

create policy "Allow public insert/update to avatars" 
  on storage.objects for all 
  using (bucket_id = 'avatars');
`;
  }
};
