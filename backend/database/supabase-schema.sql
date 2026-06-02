create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  stack text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  category text not null,
  day text not null,
  date date not null,
  planned_minutes integer not null check (planned_minutes >= 5),
  completed_minutes integer not null default 0 check (completed_minutes >= 0),
  priority text not null default 'Media',
  energy integer not null default 3 check (energy between 1 and 5),
  completed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_minutes <= planned_minutes)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  tasks text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities(user_id);
create index if not exists projects_user_id_idx on public.projects(user_id);

alter table public.users enable row level security;
alter table public.activities enable row level security;
alter table public.projects enable row level security;

grant all on table public.users to service_role;
grant all on table public.activities to service_role;
grant all on table public.projects to service_role;

revoke all on table public.users from anon, authenticated;
revoke all on table public.activities from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
