alter table public.badges add column if not exists message text not null default '';
alter table public.badges add column if not exists seen boolean not null default false;
