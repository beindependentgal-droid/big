-- Make tables readable by the anon role (public read) so the client can fetch data.
-- Run this in your Supabase SQL Editor after running `supabase-init.sql`.

-- Allow public select on core tables
-- Drop any existing policies, then create explicit public SELECT policies
drop policy if exists "Allow public select on members" on public.big_members;
create policy "Allow public select on members" on public.big_members for select using (true);

drop policy if exists "Allow public select on posts" on public.big_posts;
create policy "Allow public select on posts" on public.big_posts for select using (true);

drop policy if exists "Allow public select on events" on public.big_events;
create policy "Allow public select on events" on public.big_events for select using (true);

drop policy if exists "Allow public select on challenges" on public.big_challenges;
create policy "Allow public select on challenges" on public.big_challenges for select using (true);

drop policy if exists "Allow public select on conversations" on public.big_conversations;
create policy "Allow public select on conversations" on public.big_conversations for select using (true);

drop policy if exists "Allow public select on mentorship_pairs" on public.big_mentorship_pairs;
create policy "Allow public select on mentorship_pairs" on public.big_mentorship_pairs for select using (true);

-- Optionally grant SELECT on the tables to the anon role (helps if RLS is not used)
GRANT SELECT ON public.big_members TO anon;
GRANT SELECT ON public.big_posts TO anon;
GRANT SELECT ON public.big_events TO anon;
GRANT SELECT ON public.big_challenges TO anon;
GRANT SELECT ON public.big_conversations TO anon;
GRANT SELECT ON public.big_mentorship_pairs TO anon;

-- Ensure avatars bucket is publicly readable (if using storage policies)
-- If you created the avatars bucket via `supabase-init.sql`, the storage policies were added.
-- Run the commands above, then re-run the test or open your app to confirm Supabase connectivity.
