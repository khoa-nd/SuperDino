-- Add category to wishes
alter table public.wishes add column if not exists category text not null default 'normal';
alter table public.wishes add constraint wishes_category_check check (category in ('normal', 'other'));
