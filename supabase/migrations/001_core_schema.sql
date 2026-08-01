-- 001_core_schema.sql
-- Rebuild BIG Supabase backend schema from the frontend contract.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_members (
  id text primary key,
  name text not null,
  email text unique,
  avatar text,
  title text,
  city text,
  rank text,
  skills text[] not null default '{}'::text[],
  interests text[] not null default '{}'::text[],
  bio text,
  points integer not null default 0,
  badges text[] not null default '{}'::text[],
  business_stage text,
  mentoring_capacity text,
  "followingIds" text[] not null default '{}'::text[],
  "followerIds" text[] not null default '{}'::text[],
  "circleIds" text[] not null default '{}'::text[],
  isSuperAdmin boolean not null default false,
  isModerator boolean not null default false,
  joinedAt timestamptz,
  website text,
  linkedinUrl text,
  githubUrl text,
  twitterUrl text,
  company text,
  industry text,
  certifications text[] not null default '{}'::text[],
  endorsements jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  education jsonb not null default '[]'::jsonb,
  biometricCredentialId text,
  passwordHash text,
  passwordSalt text,
  pinHash text,
  pinSalt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_posts (
  id text primary key,
  author jsonb,
  author_id text references public.big_members(id) on delete set null,
  content text,
  timestamp timestamptz not null default now(),
  likes integer not null default 0,
  likes_ids jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  liked boolean not null default false,
  "circleId" text,
  tag text,
  tags text[] not null default '{}'::text[],
  imageUrl text,
  reactions jsonb not null default '[]'::jsonb,
  commentsDisabled boolean not null default false,
  repostsCount integer not null default 0,
  sharesCount integer not null default 0,
  scheduledFor timestamptz,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_comments (
  id text primary key,
  post_id text references public.big_posts(id) on delete cascade,
  author_id text references public.big_members(id) on delete set null,
  author jsonb,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_likes (
  id uuid primary key default gen_random_uuid(),
  post_id text references public.big_posts(id) on delete cascade,
  member_id text references public.big_members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, member_id)
);

create table if not exists public.big_events (
  id text primary key,
  title text not null,
  date date,
  time text,
  location text,
  type text,
  attendees integer not null default 0,
  attendeeNames text[] not null default '{}'::text[],
  rsvped boolean not null default false,
  description text,
  image text,
  category text,
  reminded boolean not null default false,
  createdBy text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_challenges (
  id text primary key,
  title text not null,
  description text,
  reward text,
  progress integer not null default 0,
  completed boolean not null default false,
  badge text,
  category text,
  target text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_conversations (
  id text primary key,
  member jsonb not null,
  messages jsonb not null default '[]'::jsonb,
  unread boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_mentorship_pairs (
  id text primary key,
  mentor jsonb not null,
  mentee jsonb not null,
  topic text,
  status text,
  "startDate" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_circles (
  id text primary key,
  name text not null,
  description text,
  image text,
  created_by text,
  members text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_notifications (
  id text primary key,
  recipient_id text references public.big_members(id) on delete cascade,
  payload jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.big_files (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  owner_id text references public.big_members(id) on delete set null,
  mime_type text,
  size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket, path)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  level text,
  thumbnail text,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  duration text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    'member'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

create or replace trigger trg_set_updated_at_big_members
before update on public.big_members
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_posts
before update on public.big_posts
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_comments
before update on public.big_comments
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_events
before update on public.big_events
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_challenges
before update on public.big_challenges
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_conversations
before update on public.big_conversations
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_mentorship_pairs
before update on public.big_mentorship_pairs
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_circles
before update on public.big_circles
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_notifications
before update on public.big_notifications
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_big_files
before update on public.big_files
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_courses
before update on public.courses
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_lessons
before update on public.lessons
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_applications
before update on public.applications
for each row execute function public.set_updated_at();

create or replace trigger trg_set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_big_members_email on public.big_members(email);
create index if not exists idx_big_members_points on public.big_members(points);
create index if not exists idx_big_members_name on public.big_members(name);
create index if not exists idx_big_posts_author_id on public.big_posts(author_id);
create index if not exists idx_big_posts_timestamp on public.big_posts(timestamp desc);
create index if not exists idx_big_comments_post_id on public.big_comments(post_id);
create index if not exists idx_big_events_date on public.big_events(date);
create index if not exists idx_big_notifications_recipient on public.big_notifications(recipient_id);
create index if not exists idx_big_circles_name on public.big_circles(name);
create index if not exists idx_big_files_owner on public.big_files(owner_id);
create index if not exists idx_big_likes_post_member on public.big_likes(post_id, member_id);
