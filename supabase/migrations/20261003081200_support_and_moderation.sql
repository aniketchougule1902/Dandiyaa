alter table public.event_config
  add column if not exists support_contact text;

alter table public.event_config
  drop constraint if exists event_config_support_contact_length;

alter table public.event_config
  add constraint event_config_support_contact_length
  check (support_contact is null or char_length(btrim(support_contact)) between 5 and 160);

create index if not exists reports_status_created_idx
  on public.reports (status, created_at desc);

create index if not exists deletion_requests_status_created_idx
  on public.deletion_requests (status, created_at desc);

comment on column public.event_config.support_contact is
  'Monitored grievance/support contact shown publicly. Must not contain participant private data.';
