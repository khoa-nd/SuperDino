-- Add 'assigned' to task_logs status check
alter table public.task_logs drop constraint if exists task_logs_status_check;
alter table public.task_logs add constraint task_logs_status_check check (status in ('assigned', 'pending', 'approved', 'auto-approved', 'rejected'));
