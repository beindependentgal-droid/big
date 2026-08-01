-- 002_rls_storage_realtime.sql
-- Enable RLS, storage buckets, and realtime on the tables the app uses.

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

create policy "circles_write_public"
on public.big_circles
for insert
with check (true);

create policy "circles_update_public"
on public.big_circles
for update
using (true)
with check (true);

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

alter publication supabase_realtime add table public.big_members;
alter publication supabase_realtime add table public.big_posts;
alter publication supabase_realtime add table public.big_comments;
alter publication supabase_realtime add table public.big_events;
alter publication supabase_realtime add table public.big_notifications;
alter publication supabase_realtime add table public.big_conversations;
alter publication supabase_realtime add table public.big_circles;
alter publication supabase_realtime add table public.big_likes;
