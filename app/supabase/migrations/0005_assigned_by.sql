-- Add assigned_by to task_logs
alter table public.task_logs add column if not exists assigned_by text;
