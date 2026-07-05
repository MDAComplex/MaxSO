-- Run this in your Supabase SQL Editor

-- ── MILESTONES ────────────────────────────────────────────────
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  key text not null,
  label text not null,
  category text not null,
  scenario text,
  target_date date not null,
  phase_start date,
  confidence text not null default 'estimate',
  note text,
  sort_order int not null default 0,
  created_at timestamptz default now(),
  unique (user_id, key)
);

alter table milestones enable row level security;

create policy if not exists "own rows milestones" on milestones
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── REFLECTIONS ───────────────────────────────────────────────
create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) default auth.uid(),
  date date not null,
  mood int check (mood between 1 and 5),
  energy int check (energy between 1 and 5),
  wins text,
  challenges text,
  tomorrow text,
  gratitude text,
  free_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, date)
);

alter table reflections enable row level security;

create policy if not exists "own rows reflections" on reflections
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── USER DATA (generic synced storage: habits, routines, topik, grades, focus) ──
create table if not exists user_data (
  user_id uuid references auth.users(id) default auth.uid(),
  key text not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, key)
);

alter table user_data enable row level security;

create policy if not exists "own rows user_data" on user_data
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
