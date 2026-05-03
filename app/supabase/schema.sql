create table if not exists public.families (
  id text primary key,
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id text primary key,
  username text not null,
  name text not null,
  role text not null check (role in ('child', 'parent')),
  family_id text references public.families(id) on delete cascade,
  password_hash text,
  created_at timestamptz not null default now(),
  unique (username, role)
);

create table if not exists public.tasks (
  id text primary key,
  name text not null,
  emoji text not null,
  reward integer not null check (reward >= 0),
  category text not null check (category in ('morning', 'home', 'school', 'kind', 'other')),
  auto_approve boolean not null default false,
  color text not null,
  family_id text not null references public.families(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.wishes (
  id text primary key,
  name text not null,
  emoji text not null,
  cost integer not null check (cost >= 0),
  category text not null default 'normal' check (category in ('normal', 'other')),
  color text not null,
  family_id text not null references public.families(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.task_logs (
  id text primary key,
  task_id text not null references public.tasks(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('assigned', 'pending', 'approved', 'auto-approved', 'rejected')),
  assigned_by text,
  timestamp timestamptz not null default now()
);

create table if not exists public.wish_requests (
  id text primary key,
  wish_id text not null references public.wishes(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  timestamp timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('earn', 'spend')),
  amount integer not null check (amount >= 0),
  label text not null,
  timestamp timestamptz not null default now()
);

insert into public.families (id, name, code)
values ('f1', 'Dino Family', 'DINO-F1')
on conflict (id) do nothing;

insert into public.profiles (id, username, name, role, family_id)
values
  ('parent-demo', 'parent', 'Parent', 'parent', 'f1'),
  ('kid-demo', 'mia', 'Mia', 'child', 'f1')
on conflict (username, role) do nothing;

insert into public.tasks (id, name, emoji, reward, category, auto_approve, color, family_id)
values
  ('t1', 'Brush teeth', '🦷', 2, 'morning', true, 'oklch(0.92 0.06 240)', 'f1'),
  ('t2', 'Make my bed', '🛏️', 3, 'morning', true, 'oklch(0.94 0.06 90)', 'f1'),
  ('t3', 'Read 20 minutes', '📚', 5, 'school', false, 'oklch(0.93 0.07 30)', 'f1'),
  ('t4', 'Feed the dog', '🐶', 4, 'home', true, 'oklch(0.93 0.07 60)', 'f1'),
  ('t5', 'Tidy my room', '🧹', 6, 'home', false, 'oklch(0.93 0.06 145)', 'f1'),
  ('t6', 'Help with dinner', '🥗', 4, 'kind', false, 'oklch(0.92 0.07 145)', 'f1'),
  ('t7', 'Practice piano', '🎵', 5, 'school', false, 'oklch(0.93 0.06 280)', 'f1'),
  ('t8', 'Be kind to bro', '💚', 3, 'kind', true, 'oklch(0.93 0.07 30)', 'f1')
on conflict (id) do nothing;

insert into public.wishes (id, name, emoji, cost, category, color, family_id)
values
  ('w1', 'Movie night', '🎬', 12, 'normal', 'oklch(0.92 0.07 280)', 'f1'),
  ('w2', 'Ice cream trip', '🍦', 8, 'normal', 'oklch(0.94 0.07 30)', 'f1'),
  ('w3', 'New book', '📖', 20, 'normal', 'oklch(0.92 0.07 145)', 'f1'),
  ('w4', 'Park playdate', '🛝', 15, 'normal', 'oklch(0.93 0.07 90)', 'f1'),
  ('w5', 'Stay up late', '🌙', 10, 'normal', 'oklch(0.92 0.06 240)', 'f1'),
  ('w6', 'Pick dinner', '🍕', 6, 'normal', 'oklch(0.94 0.07 60)', 'f1')
on conflict (id) do nothing;
