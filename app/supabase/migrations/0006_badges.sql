create table if not exists public.badges (
  id text primary key,
  child_id text not null references public.profiles(id) on delete cascade,
  granted_by_id text not null references public.profiles(id) on delete cascade,
  granted_by_name text not null default '',
  image text not null,
  label text not null,
  month text not null,
  week integer not null default 1,
  revoked boolean not null default false,
  granted_at timestamptz not null default now()
);

alter table public.badges enable row level security;
