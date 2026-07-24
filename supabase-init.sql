-- Run this in your Supabase SQL Editor to prepare your tables!

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
  "circleIds" text[] default '{}'::text[]
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
  "circleId" text
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
  rsvped boolean default false,
  description text
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
  category text
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

-- Policies (create/drop/recreate) and storage bucket creation follow... (see panel in app for full script)
