create extension if not exists pgcrypto;

create table if not exists public.event_config (
  id smallint primary key default 1 check (id = 1),
  title text not null default 'Dandiyaa Night',
  registration_closes_at timestamptz not null,
  status text not null default 'open' check (status in ('open', 'closed', 'matched')),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 2 and 80),
  college text not null check (college in ('pccoe', 'dyp')),
  study_year smallint not null check (study_year between 1 and 6),
  contact_private text not null check (char_length(contact_private) between 6 and 120),
  social_private text,
  prn_private text not null check (char_length(prn_private) between 3 and 80),
  preference text not null check (preference in ('senior', 'junior', 'same_year', 'any')),
  claim_token_hash text not null unique,
  age_18_confirmed boolean not null check (age_18_confirmed),
  matching_consent boolean not null check (matching_consent),
  privacy_consent boolean not null check (privacy_consent),
  non_affiliation_acknowledged boolean not null check (non_affiliation_acknowledged),
  consented_at timestamptz not null default now(),
  status text not null default 'waiting' check (status in ('waiting', 'matched', 'rejected', 'blocked', 'withdrawn'))
);

create unique index if not exists participants_college_prn_unique
  on public.participants (college, lower(btrim(prn_private)));

create index if not exists participants_match_pool_idx
  on public.participants (college, status, study_year, preference);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  college text not null check (college in ('pccoe', 'dyp')),
  participant_a uuid not null references public.participants(id) on delete cascade,
  participant_b uuid not null references public.participants(id) on delete cascade,
  algorithm_score integer not null default 0,
  status text not null default 'active' check (status in ('active', 'accepted', 'rejected', 'blocked', 'superseded')),
  a_response text not null default 'pending' check (a_response in ('pending', 'accepted', 'rejected', 'blocked', 'reported')),
  b_response text not null default 'pending' check (b_response in ('pending', 'accepted', 'rejected', 'blocked', 'reported')),
  contact_revealed_at timestamptz,
  check (participant_a <> participant_b)
);

create index if not exists matches_a_idx on public.matches (participant_a, created_at desc);
create index if not exists matches_b_idx on public.matches (participant_b, created_at desc);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reporter_id uuid not null references public.participants(id) on delete cascade,
  reported_participant_id uuid references public.participants(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  reason text not null check (char_length(reason) between 1 and 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed'))
);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'completed', 'rejected'))
);

create table if not exists public.admin_audit (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action text not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.event_config enable row level security;
alter table public.participants enable row level security;
alter table public.matches enable row level security;
alter table public.reports enable row level security;
alter table public.deletion_requests enable row level security;
alter table public.admin_audit enable row level security;

revoke all on public.event_config from anon, authenticated;
revoke all on public.participants from anon, authenticated;
revoke all on public.matches from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.deletion_requests from anon, authenticated;
revoke all on public.admin_audit from anon, authenticated;

create or replace function public.apply_match_batch(payload jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  created_count integer := 0;
  a_id uuid;
  b_id uuid;
  pair_college text;
  score_value integer;
begin
  if coalesce(jsonb_typeof(payload), '') <> 'array' then
    raise exception 'payload must be a JSON array';
  end if;

  for item in select value from jsonb_array_elements(payload)
  loop
    a_id := (item->>'participantA')::uuid;
    b_id := (item->>'participantB')::uuid;
    pair_college := item->>'college';
    score_value := coalesce((item->>'score')::integer, 0);

    if pair_college not in ('pccoe', 'dyp') then
      raise exception 'invalid college';
    end if;

    if not exists (
      select 1 from public.participants p
      where p.id = a_id and p.college = pair_college and p.status = 'waiting'
    ) or not exists (
      select 1 from public.participants p
      where p.id = b_id and p.college = pair_college and p.status = 'waiting'
    ) then
      raise exception 'participant unavailable or college mismatch';
    end if;

    insert into public.matches (college, participant_a, participant_b, algorithm_score)
    values (pair_college, a_id, b_id, score_value);

    update public.participants
    set status = 'matched'
    where id in (a_id, b_id);

    created_count := created_count + 1;
  end loop;

  update public.event_config
  set status = 'matched', updated_at = now()
  where id = 1;

  insert into public.admin_audit(action, metadata)
  values ('generate_matches', jsonb_build_object('pairs', created_count));

  return created_count;
end;
$$;

revoke all on function public.apply_match_batch(jsonb) from public, anon, authenticated;
grant execute on function public.apply_match_batch(jsonb) to service_role;

insert into public.event_config (id, registration_closes_at)
values (1, now() + interval '7 days')
on conflict (id) do nothing;
