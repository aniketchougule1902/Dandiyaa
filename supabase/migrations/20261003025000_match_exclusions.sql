create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  blocker_id uuid not null references public.participants(id) on delete cascade,
  blocked_id uuid not null references public.participants(id) on delete cascade,
  match_id uuid references public.matches(id) on delete set null,
  unique (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;
revoke all on public.blocks from anon, authenticated;

create unique index if not exists deletion_requests_one_open_per_participant
  on public.deletion_requests (participant_id)
  where status = 'open';
