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
