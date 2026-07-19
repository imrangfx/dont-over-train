-- public.workouts
-- Stores completed workouts for authenticated users.
-- Guests continue to use localStorage; this table is only written/read
-- when a Supabase session exists.

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_date timestamptz not null default now(),
  body_parts text,
  duration_minutes int4,
  total_sets int4,
  total_reps int4,
  workout_score int4,
  fatigue jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_id_workout_date_idx
  on public.workouts (user_id, workout_date desc);

alter table public.workouts enable row level security;

create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- public.personal_records
-- Progressive Overload leveling system: tracks each signed-in user's
-- highest-ever lifted weight per exercise. One row per (user, exercise) -
-- a new PR simply overwrites the previous weight for that exercise, so the
-- stored value is always the all-time max and levels derived from it can
-- never regress. Guests keep the same data shape in localStorage.

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exercise_name text not null,
  body_part text,
  category text,
  weight numeric not null,
  achieved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, exercise_name)
);

create index if not exists personal_records_user_id_idx
  on public.personal_records (user_id);

alter table public.personal_records enable row level security;

create policy "Users can view their own personal records"
  on public.personal_records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own personal records"
  on public.personal_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own personal records"
  on public.personal_records for update
  using (auth.uid() = user_id);

create policy "Users can delete their own personal records"
  on public.personal_records for delete
  using (auth.uid() = user_id);

-- ==================================================
-- Social Lite: Friend System + Public Friend Profile
-- ==================================================
-- NOTE: public.profiles already exists (created outside this file). The
-- statements below are additive and idempotent (drop-if-exists before
-- create-policy), but review them before running if you have customized
-- profiles RLS already. Only identity fields (name, avatar, username) are
-- exposed broadly here - workout/PR data is friend-gated further below.
-- Email/auth data are never stored on profiles, so this cannot leak them.

alter table public.profiles enable row level security;

alter table public.profiles add column if not exists username text unique;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- public.friend_requests
-- A pending request from sender_id to receiver_id. Deleted on
-- accept/decline/cancel - accepted requests become a public.friendships row.

create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friend_requests_no_self check (sender_id <> receiver_id),
  constraint friend_requests_unique_pair unique (sender_id, receiver_id)
);

create index if not exists friend_requests_receiver_idx
  on public.friend_requests (receiver_id);

create index if not exists friend_requests_sender_idx
  on public.friend_requests (sender_id);

alter table public.friend_requests enable row level security;

drop policy if exists "Users can view requests they sent or received" on public.friend_requests;
create policy "Users can view requests they sent or received"
  on public.friend_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send their own friend requests" on public.friend_requests;
create policy "Users can send their own friend requests"
  on public.friend_requests for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can delete requests they sent or received" on public.friend_requests;
create policy "Users can delete requests they sent or received"
  on public.friend_requests for delete
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- public.friendships
-- One row per accepted friendship. user_id_a is always the lexicographically
-- smaller uuid so a pair can never be stored twice (also enforced by the
-- unique constraint) - this is what "avoid duplicated data" means here.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id_a uuid not null references public.profiles (id) on delete cascade,
  user_id_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint friendships_ordered check (user_id_a < user_id_b),
  constraint friendships_unique_pair unique (user_id_a, user_id_b)
);

create index if not exists friendships_user_a_idx
  on public.friendships (user_id_a);

create index if not exists friendships_user_b_idx
  on public.friendships (user_id_b);

alter table public.friendships enable row level security;

drop policy if exists "Users can view their own friendships" on public.friendships;
create policy "Users can view their own friendships"
  on public.friendships for select
  using (auth.uid() = user_id_a or auth.uid() = user_id_b);

drop policy if exists "Users can create friendships they are part of" on public.friendships;
create policy "Users can create friendships they are part of"
  on public.friendships for insert
  with check (auth.uid() = user_id_a or auth.uid() = user_id_b);

drop policy if exists "Users can remove their own friendships" on public.friendships;
create policy "Users can remove their own friendships"
  on public.friendships for delete
  using (auth.uid() = user_id_a or auth.uid() = user_id_b);

-- ==================================================
-- Security hardening: friend-gated reads
-- ==================================================
-- public.are_friends(a, b)
-- Single source of truth for "is A friends with B", reused by every table
-- that needs friend-gated access (today: personal_records, workouts;
-- tomorrow: any Leaderboard/Achievements table can reuse the same
-- predicate instead of re-deriving it). SECURITY DEFINER + a pinned
-- search_path is the standard-safe pattern for a helper referenced inside
-- other tables' RLS policies: it runs with the function owner's privileges
-- so it can't be tricked by a caller-controlled search_path, and it keeps
-- the friendships lookup O(1) via the existing unique index instead of
-- letting Postgres re-evaluate friendships' own RLS policy on every call.
create or replace function public.are_friends(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.friendships f
    where f.user_id_a = least(user_a, user_b)
      and f.user_id_b = greatest(user_a, user_b)
  );
$$;

revoke all on function public.are_friends(uuid, uuid) from public;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- Replace the broad "any authenticated user can read" policies from the
-- initial Social Lite rollout with least-privilege ones: a row is only
-- readable by its owner (unchanged) or a confirmed friend of the owner.
-- Search still works because it only ever queries public.profiles
-- (identity only, no workout/PR data). Non-friend search results and
-- non-friend Public Friend Profile views simply receive no personal_records
-- or workouts rows - the app already renders that as "no data yet" rather
-- than fabricating a fake Level, so nothing is redesigned, just no longer
-- exposed pre-friendship.

drop policy if exists "Authenticated users can view any personal records" on public.personal_records;
drop policy if exists "Owners and friends can view personal records" on public.personal_records;
create policy "Owners and friends can view personal records"
  on public.personal_records for select
  using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));

drop policy if exists "Authenticated users can view any workouts" on public.workouts;
drop policy if exists "Owners and friends can view workouts" on public.workouts;
create policy "Owners and friends can view workouts"
  on public.workouts for select
  using (auth.uid() = user_id or public.are_friends(auth.uid(), user_id));
