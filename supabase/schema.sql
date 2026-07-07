-- Atlas CRM schema. Run this once in the Supabase SQL editor
-- (Dashboard → SQL Editor → paste → Run), or via psql.
-- The app seeds the tables with demo data on first load when they are empty.

create table if not exists public.assets (
  id         text primary key,
  name       text not null,
  short      text not null default '',
  type       text not null default 'Office',
  loc        text not null default '—',
  manager    text not null default '',
  tenant_rep text,  -- broker id when a broker holds the mandate on this asset
  subs       jsonb not null default '[]'::jsonb,
  position   integer not null default 0
);
-- Upgrade for databases created before tenant_rep existed:
alter table public.assets add column if not exists tenant_rep text;

create table if not exists public.brokers (
  id       text primary key,
  name     text not null,
  contacts jsonb not null default '[]'::jsonb,
  position integer not null default 0
);

create table if not exists public.managers (
  id       text primary key,
  name     text not null,
  init     text not null default '',
  position integer not null default 0
);

create table if not exists public.stages (
  id       text primary key,
  label    text not null,
  dot      text not null default '#948A7B',
  position integer not null default 0
);

create table if not exists public.leads (
  id             text primary key,
  company        text not null,
  contact        text not null default '',
  type           text not null default 'Office',
  sqm            double precision not null default 0,
  asset_id       text not null,
  sub_id         text,
  stage          text not null,
  broker_contact text not null default '',
  next_step      text not null default '',
  when_label     text,
  position       integer not null default 0
);

-- Demo-grade access: the app talks to the DB directly with the public anon
-- key, so anon gets full CRUD. Replace these policies with real auth-based
-- rules before putting anything sensitive in here.
alter table public.assets   enable row level security;
alter table public.brokers  enable row level security;
alter table public.managers enable row level security;
alter table public.stages   enable row level security;
alter table public.leads    enable row level security;

drop policy if exists "atlas open access" on public.assets;
drop policy if exists "atlas open access" on public.brokers;
drop policy if exists "atlas open access" on public.managers;
drop policy if exists "atlas open access" on public.stages;
drop policy if exists "atlas open access" on public.leads;

create policy "atlas open access" on public.assets   for all using (true) with check (true);
create policy "atlas open access" on public.brokers  for all using (true) with check (true);
create policy "atlas open access" on public.managers for all using (true) with check (true);
create policy "atlas open access" on public.stages   for all using (true) with check (true);
create policy "atlas open access" on public.leads    for all using (true) with check (true);
