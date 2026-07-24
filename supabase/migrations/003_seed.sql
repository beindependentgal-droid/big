-- 003_seed.sql
-- Seed the application with starter BIG data.

insert into public.big_members (
  id, name, email, avatar, title, city, rank, skills, interests, bio, points, badges,
  followingIds, followerIds, circleIds, isSuperAdmin, isModerator, joinedAt,
  website, linkedinUrl, githubUrl, twitterUrl, company, industry,
  certifications, endorsements, recommendations, experience, education,
  biometricCredentialId, passwordHash, passwordSalt, pinHash, pinSalt
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
  followingIds = excluded."followingIds",
  followerIds = excluded."followerIds",
  circleIds = excluded."circleIds",
  isSuperAdmin = excluded."isSuperAdmin",
  isModerator = excluded."isModerator",
  joinedAt = excluded."joinedAt";

insert into public.big_events (id, title, date, time, location, type, attendees, attendeeNames, rsvped, description, image, category, reminded, createdBy)
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
  attendeeNames = excluded.attendeeNames,
  rsvped = excluded.rsvped,
  description = excluded.description,
  category = excluded.category,
  reminded = excluded.reminded,
  createdBy = excluded.createdBy;

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
