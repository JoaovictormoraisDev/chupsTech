create table if not exists public.project_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, project_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'projects_id_user_id_unique'
  ) then
    alter table public.projects
      add constraint projects_id_user_id_unique unique (id, user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'project_favorites_project_owner_fk'
  ) then
    alter table public.project_favorites
      add constraint project_favorites_project_owner_fk
      foreign key (project_id, user_id)
      references public.projects(id, user_id)
      on delete cascade;
  end if;
end $$;

create index if not exists project_favorites_user_id_idx
  on public.project_favorites(user_id);

create index if not exists project_favorites_project_id_idx
  on public.project_favorites(project_id);

alter table public.project_favorites enable row level security;

grant all on table public.project_favorites to service_role;
revoke all on table public.project_favorites from anon, authenticated;
