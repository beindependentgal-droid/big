-- BIG_COMPLETE_DATABASE.sql
-- Idempotent single-shot Supabase rebuild for the BIG app.
-- Run this in Supabase SQL Editor.

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

alter table if exists public.profiles
  add column if not exists updated_at timestamptz not null default now();

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
  "isSuperAdmin" boolean not null default false,
  "isModerator" boolean not null default false,
  "joinedAt" timestamptz,
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
  "biometricCredentialId" text,
  "passwordHash" text,
  "passwordSalt" text,
  "pinHash" text,
  "pinSalt" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_members
  add column if not exists "followingIds" text[] not null default '{}'::text[],
  add column if not exists "followerIds" text[] not null default '{}'::text[],
  add column if not exists "circleIds" text[] not null default '{}'::text[],
  add column if not exists "isSuperAdmin" boolean not null default false,
  add column if not exists "isModerator" boolean not null default false,
  add column if not exists "joinedAt" timestamptz,
  add column if not exists "linkedinUrl" text,
  add column if not exists "githubUrl" text,
  add column if not exists "twitterUrl" text,
  add column if not exists "biometricCredentialId" text,
  add column if not exists "passwordHash" text,
  add column if not exists "passwordSalt" text,
  add column if not exists "pinHash" text,
  add column if not exists "pinSalt" text,
  add column if not exists updated_at timestamptz not null default now();

update public.big_members
set "linkedinUrl" = coalesce("linkedinUrl", linkedinurl),
    "githubUrl" = coalesce("githubUrl", githuburl),
    "twitterUrl" = coalesce("twitterUrl", twitterurl)
where "linkedinUrl" is null or "githubUrl" is null or "twitterUrl" is null;

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
  "imageUrl" text,
  reactions jsonb not null default '[]'::jsonb,
  "commentsDisabled" boolean not null default false,
  "repostsCount" integer not null default 0,
  "sharesCount" integer not null default 0,
  "scheduledFor" timestamptz,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_posts
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.big_comments (
  id text primary key,
  post_id text references public.big_posts(id) on delete cascade,
  author_id text references public.big_members(id) on delete set null,
  author jsonb,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_comments
  add column if not exists updated_at timestamptz not null default now();

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
  "attendeeNames" text[] not null default '{}'::text[],
  rsvped boolean not null default false,
  description text,
  image text,
  category text,
  reminded boolean not null default false,
  "createdBy" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_events
  add column if not exists "attendeeNames" text[] not null default '{}'::text[],
  add column if not exists "createdBy" text,
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.big_challenges
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.big_conversations (
  id text primary key,
  member jsonb not null,
  messages jsonb not null default '[]'::jsonb,
  unread boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_conversations
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.big_mentorship_pairs
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.big_circles
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.big_notifications (
  id text primary key,
  recipient_id text references public.big_members(id) on delete cascade,
  payload jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.big_notifications
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.big_files
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.courses
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  duration text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.lessons
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.applications
  add column if not exists updated_at timestamptz not null default now();

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

alter table if exists public.profiles enable row level security;
alter table if exists public.big_members enable row level security;
alter table if exists public.big_posts enable row level security;
alter table if exists public.big_comments enable row level security;
alter table if exists public.big_likes enable row level security;
alter table if exists public.big_events enable row level security;
alter table if exists public.big_challenges enable row level security;
alter table if exists public.big_conversations enable row level security;
alter table if exists public.big_mentorship_pairs enable row level security;
alter table if exists public.big_circles enable row level security;
alter table if exists public.big_notifications enable row level security;
alter table if exists public.big_files enable row level security;

drop policy if exists "profiles_read_public" on public.profiles;
drop policy if exists "profiles_write_authenticated" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "members_read_public" on public.big_members;
drop policy if exists "members_write_public" on public.big_members;
drop policy if exists "members_update_own" on public.big_members;
drop policy if exists "posts_read_public" on public.big_posts;
drop policy if exists "posts_write_public" on public.big_posts;
drop policy if exists "posts_update_own" on public.big_posts;
drop policy if exists "comments_read_public" on public.big_comments;
drop policy if exists "comments_write_public" on public.big_comments;
drop policy if exists "events_read_public" on public.big_events;
drop policy if exists "events_write_public" on public.big_events;
drop policy if exists "events_update_public" on public.big_events;
drop policy if exists "likes_read_public" on public.big_likes;
drop policy if exists "likes_write_public" on public.big_likes;
drop policy if exists "circles_read_public" on public.big_circles;
drop policy if exists "conversations_read_public" on public.big_conversations;
drop policy if exists "notifications_read_public" on public.big_notifications;
drop policy if exists "notifications_write_public" on public.big_notifications;
drop policy if exists "files_read_public" on public.big_files;
drop policy if exists "files_write_public" on public.big_files;
drop policy if exists "files_update_own" on public.big_files;

create policy "profiles_read_public"
on public.profiles
for select
using (true);

create policy "profiles_write_authenticated"
on public.profiles
for insert
with check (auth.role() = 'authenticated');

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "members_read_public"
on public.big_members
for select
using (true);

create policy "members_write_public"
on public.big_members
for insert
with check (true);

create policy "members_update_own"
on public.big_members
for update
using (id = auth.uid()::text or auth.role() = 'service_role')
with check (id = auth.uid()::text or auth.role() = 'service_role');

create policy "posts_read_public"
on public.big_posts
for select
using (true);

create policy "posts_write_public"
on public.big_posts
for insert
with check (true);

create policy "posts_update_own"
on public.big_posts
for update
using (author_id = auth.uid()::text or auth.role() = 'service_role')
with check (author_id = auth.uid()::text or auth.role() = 'service_role');

create policy "comments_read_public"
on public.big_comments
for select
using (true);

create policy "comments_write_public"
on public.big_comments
for insert
with check (true);

create policy "events_read_public"
on public.big_events
for select
using (true);

create policy "events_write_public"
on public.big_events
for insert
with check (true);

create policy "events_update_public"
on public.big_events
for update
using (true)
with check (true);

create policy "likes_read_public"
on public.big_likes
for select
using (true);

create policy "likes_write_public"
on public.big_likes
for insert
with check (true);

create policy "circles_read_public"
on public.big_circles
for select
using (true);

create policy "conversations_read_public"
on public.big_conversations
for select
using (true);

create policy "notifications_read_public"
on public.big_notifications
for select
using (true);

create policy "notifications_write_public"
on public.big_notifications
for insert
with check (true);

create policy "files_read_public"
on public.big_files
for select
using (true);

create policy "files_write_public"
on public.big_files
for insert
with check (true);

create policy "files_update_own"
on public.big_files
for update
using (owner_id = auth.uid()::text or auth.role() = 'service_role')
with check (owner_id = auth.uid()::text or auth.role() = 'service_role');

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('posts', 'posts', true),
  ('events', 'events', true),
  ('certificates', 'certificates', true),
  ('documents', 'documents', true),
  ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "storage_read_public_avatars" on storage.objects;
drop policy if exists "storage_read_public_posts" on storage.objects;
drop policy if exists "storage_read_public_events" on storage.objects;
drop policy if exists "storage_read_public_documents" on storage.objects;
drop policy if exists "storage_read_public_certificates" on storage.objects;
drop policy if exists "storage_manage_public" on storage.objects;
drop policy if exists "storage_update_public" on storage.objects;

create policy "storage_read_public_avatars"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "storage_read_public_posts"
on storage.objects
for select
using (bucket_id = 'posts');

create policy "storage_read_public_events"
on storage.objects
for select
using (bucket_id = 'events');

create policy "storage_read_public_documents"
on storage.objects
for select
using (bucket_id = 'documents');

create policy "storage_read_public_certificates"
on storage.objects
for select
using (bucket_id = 'certificates');

create policy "storage_manage_public"
on storage.objects
for insert
with check (bucket_id in ('avatars','posts','events','certificates','documents','uploads'));

create policy "storage_update_public"
on storage.objects
for update
using (bucket_id in ('avatars','posts','events','certificates','documents','uploads'))
with check (bucket_id in ('avatars','posts','events','certificates','documents','uploads'));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_members'
  ) then
    alter publication supabase_realtime add table public.big_members;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_posts'
  ) then
    alter publication supabase_realtime add table public.big_posts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_comments'
  ) then
    alter publication supabase_realtime add table public.big_comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_events'
  ) then
    alter publication supabase_realtime add table public.big_events;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_notifications'
  ) then
    alter publication supabase_realtime add table public.big_notifications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_conversations'
  ) then
    alter publication supabase_realtime add table public.big_conversations;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_circles'
  ) then
    alter publication supabase_realtime add table public.big_circles;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'big_likes'
  ) then
    alter publication supabase_realtime add table public.big_likes;
  end if;
end;
$$;

insert into public.big_members (
  id, name, email, avatar, title, city, rank, skills, interests, bio, points, badges,
  "followingIds", "followerIds", "circleIds", "isSuperAdmin", "isModerator", "joinedAt",
  website, linkedinUrl, githubUrl, twitterUrl, company, industry,
  certifications, endorsements, recommendations, experience, education,
  "biometricCredentialId", "passwordHash", "passwordSalt", "pinHash", "pinSalt"
)
values
  (
    'm1', 'Fatma J.', 'fatma@example.com', '/images/african_woman_portrait_1_1784708232425.jpg', 'Fashion Designer', 'Nairobi', 'Mentor',
    array['AI in Design', 'Sustainable Fashion'], array['Tech', 'Design'],
    'Experienced designer helping others integrate tech into fashion.', 1250, array['Mentor', 'Top Contributor'],
    array[]::text[], array[]::text[], array[]::text[], false, false, now() - interval '6 days',
    null, null, null, null, null, null, array[]::text[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
    null, null, null, null, null
  ),
  (
    'm2', 'Sienna N.', 'sienna@example.com', '/images/african_woman_portrait_2_1784708246407.jpg', 'Founder, EcoStyles', 'Cape Town', 'Connector',
    array['E-commerce', 'Scaling'], array['Sustainability', 'Business'],
    'Building the future of eco-friendly fashion.', 850, array['Founder'],
    array[]::text[], array[]::text[], array[]::text[], false, false, now() - interval '5 days',
    null, null, null, null, null, null, array[]::text[], '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
    null, null, null, null, null
  )
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  avatar = excluded.avatar,
  title = excluded.title,
  city = excluded.city,
  rank = excluded.rank,
  skills = excluded.skills,
  interests = excluded.interests,
  bio = excluded.bio,
  points = excluded.points,
  badges = excluded.badges,
  "followingIds" = excluded."followingIds",
  "followerIds" = excluded."followerIds",
  "circleIds" = excluded."circleIds",
  "isSuperAdmin" = excluded."isSuperAdmin",
  "isModerator" = excluded."isModerator",
  "joinedAt" = excluded."joinedAt";

insert into public.big_events (id, title, date, time, location, type, attendees, "attendeeNames", rsvped, description, image, category, reminded, "createdBy")
values
  ('e1', 'Fashion Tech Workshop', '2026-07-20', '14:00', 'Online', 'workshop', 45, array['Fatma J.', 'Sienna N.', 'Dr. Amina'], false, 'Learn how to integrate AI into your fashion design workflow.', null, 'tech', false, 'm1'),
  ('e2', 'Lagos Founders Meetup', '2026-07-25', '18:00', 'Lagos, Nigeria', 'meetup', 120, array['Wanjiku K.', 'Grace M.', 'You'], true, 'Networking event for female founders in Lagos.', null, 'connect', false, 'm2')
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  time = excluded.time,
  location = excluded.location,
  type = excluded.type,
  attendees = excluded.attendees,
  "attendeeNames" = excluded."attendeeNames",
  rsvped = excluded.rsvped,
  description = excluded.description,
  category = excluded.category,
  reminded = excluded.reminded,
  "createdBy" = excluded."createdBy";

insert into public.big_challenges (id, title, description, reward, progress, completed, badge, category, target)
values
  ('c1', 'Lead with Confidence', 'Complete onboarding and unlock confidence streaks.', '250 points', 0, false, 'confidence', 'growth', '3 actions')
on conflict (id) do nothing;

insert into public.big_circles (id, name, description, image, created_by, members, metadata)
values
  ('circle-1', 'Learn Academy Lounge', 'Discuss curriculum and study notes.', null, 'm1', array['m1', 'm2'], '{"private": false}'::jsonb)
on conflict (id) do nothing;

insert into public.badges (code, title, description, color)
values
  ('mentor', 'Mentor', 'Supports community growth.', '#8b5cf6'),
  ('top-contributor', 'Top Contributor', 'Helpful and high-impact contribution.', '#0ea5e9')
on conflict (code) do nothing;

insert into public.skills (name, category)
values
  ('AI in Design', 'creative'),
  ('Sustainable Fashion', 'creative'),
  ('E-commerce', 'business'),
  ('Scaling', 'business')
on conflict (name) do nothing;
