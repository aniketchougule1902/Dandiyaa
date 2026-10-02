alter table public.event_config add column if not exists support_contact text;
create index if not exists reports_status_created_idx on public.reports (status, created_at desc);
create index if not exists deletion_requests_status_created_idx on public.deletion_requests (status, created_at desc);
