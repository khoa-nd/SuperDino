-- Add password_hash to profiles
alter table public.profiles add column if not exists password_hash text;

-- Update tasks category constraint to include 'other'
alter table public.tasks drop constraint if exists tasks_category_check;
alter table public.tasks add constraint tasks_category_check check (category in ('morning', 'home', 'school', 'kind', 'other'));
