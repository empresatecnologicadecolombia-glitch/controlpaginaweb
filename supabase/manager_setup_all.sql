-- OnniVers Control Manager - Setup completo (roles, auditoría, perfiles, conciertos, streams, config, eventos).
-- Ejecuta TODO este archivo en Supabase → SQL Editor.

-- =============== EXTENSIONS (si aplica) ===============
-- Necesario para gen_random_uuid()
create extension if not exists "pgcrypto";

-- =============== SEGURIDAD MANAGER (roles + auditoría) ===============
create table if not exists public.manager_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('superadmin', 'moderador', 'soporte')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id bigserial primary key,
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  target_table text,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.manager_roles enable row level security;
alter table public.admin_audit_log enable row level security;

create or replace function public.is_manager_role(required_role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.manager_roles r
    where r.user_id = auth.uid()
      and (r.role = required_role or r.role = 'superadmin')
  );
$$;

drop policy if exists "ManagerRoles: select" on public.manager_roles;
create policy "ManagerRoles: select"
  on public.manager_roles for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "ManagerRoles: insert" on public.manager_roles;
create policy "ManagerRoles: insert"
  on public.manager_roles for insert
  to authenticated
  with check (public.is_manager_role('superadmin'));

drop policy if exists "ManagerRoles: update" on public.manager_roles;
create policy "ManagerRoles: update"
  on public.manager_roles for update
  to authenticated
  using (public.is_manager_role('superadmin'))
  with check (public.is_manager_role('superadmin'));

drop policy if exists "ManagerRoles: delete" on public.manager_roles;
create policy "ManagerRoles: delete"
  on public.manager_roles for delete
  to authenticated
  using (public.is_manager_role('superadmin'));

drop policy if exists "Audit: select" on public.admin_audit_log;
create policy "Audit: select"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Audit: insert" on public.admin_audit_log;
create policy "Audit: insert"
  on public.admin_audit_log for insert
  to authenticated
  with check (public.is_manager_role('soporte'));

-- =============== PROFILES (extender + RLS manager) ===============
alter table public.profiles
  add column if not exists email text,
  add column if not exists blocked boolean not null default false,
  add column if not exists registration_error text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists last_login_at timestamptz;

alter table public.profiles enable row level security;

drop policy if exists "Manager: leer profiles" on public.profiles;
create policy "Manager: leer profiles"
  on public.profiles for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: actualizar profiles" on public.profiles;
create policy "Manager: actualizar profiles"
  on public.profiles for update
  to authenticated
  using (public.is_manager_role('moderador'))
  with check (public.is_manager_role('moderador'));

drop policy if exists "Manager: eliminar profiles" on public.profiles;
create policy "Manager: eliminar profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_manager_role('superadmin'));

-- =============== CONCIERTOS + STREAMS ===============
create table if not exists public.concerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  creator_user_id uuid references auth.users (id) on delete set null,
  event_at timestamptz,
  timezone text default 'America/Bogota',
  status text not null default 'pendiente'
    check (status in ('pendiente','aprobado','rechazado','en_vivo','finalizado')),
  hls_code text,
  banner_url text,
  capacity integer,
  viewers_count integer not null default 0,
  featured boolean not null default false,
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Opcional (recomendado): FK suave para poder relacionar creator_user_id con profiles.id
-- (profiles.id suele ser el mismo UUID de auth.users.id).
-- Si tu tabla profiles ya usa ese patrón, puedes habilitar esto:
-- alter table public.concerts
--   add constraint concerts_creator_profile_fk
--   foreign key (creator_user_id) references public.profiles (id) on delete set null;

create index if not exists concerts_status_idx on public.concerts (status);
create index if not exists concerts_created_at_idx on public.concerts (created_at desc);

create table if not exists public.streams (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid references public.concerts (id) on delete set null,
  creator_user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pendiente' check (status in ('pendiente','en_vivo','finalizado','error')),
  hls_url text,
  started_at timestamptz,
  ended_at timestamptz,
  viewers_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists streams_status_idx on public.streams (status);
create index if not exists streams_created_at_idx on public.streams (created_at desc);

alter table public.concerts enable row level security;
alter table public.streams enable row level security;

drop policy if exists "Manager: read concerts" on public.concerts;
create policy "Manager: read concerts"
  on public.concerts for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: update concerts" on public.concerts;
create policy "Manager: update concerts"
  on public.concerts for update
  to authenticated
  using (public.is_manager_role('moderador'))
  with check (public.is_manager_role('moderador'));

drop policy if exists "Manager: delete concerts" on public.concerts;
create policy "Manager: delete concerts"
  on public.concerts for delete
  to authenticated
  using (public.is_manager_role('superadmin'));

drop policy if exists "Manager: read streams" on public.streams;
create policy "Manager: read streams"
  on public.streams for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: update streams" on public.streams;
create policy "Manager: update streams"
  on public.streams for update
  to authenticated
  using (public.is_manager_role('moderador'))
  with check (public.is_manager_role('moderador'));

drop policy if exists "Manager: delete streams" on public.streams;
create policy "Manager: delete streams"
  on public.streams for delete
  to authenticated
  using (public.is_manager_role('superadmin'));

-- =============== FRIEND REQUESTS (métrica) ===============
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users (id) on delete cascade,
  to_user_id uuid references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active','accepted','rejected','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.friend_requests enable row level security;

drop policy if exists "Manager: read friend_requests" on public.friend_requests;
create policy "Manager: read friend_requests"
  on public.friend_requests for select
  to authenticated
  using (public.is_manager_role('soporte'));

-- =============== SYSTEM EVENTS (opcional para Dashboard/Logs) ===============
create table if not exists public.system_events (
  id bigserial primary key,
  level text not null default 'info' check (level in ('info','warn','error','critical')),
  event_type text not null,
  message text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.system_events enable row level security;

drop policy if exists "Manager: read system_events" on public.system_events;
create policy "Manager: read system_events"
  on public.system_events for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: insert system_events" on public.system_events;
create policy "Manager: insert system_events"
  on public.system_events for insert
  to authenticated
  with check (public.is_manager_role('moderador'));

-- =============== SETTINGS / FEATURE FLAGS ===============
create table if not exists public.global_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.global_settings enable row level security;
alter table public.feature_flags enable row level security;

drop policy if exists "Manager: read global_settings" on public.global_settings;
create policy "Manager: read global_settings"
  on public.global_settings for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: update global_settings" on public.global_settings;
create policy "Manager: update global_settings"
  on public.global_settings for update
  to authenticated
  using (public.is_manager_role('superadmin'))
  with check (public.is_manager_role('superadmin'));

drop policy if exists "Manager: read feature_flags" on public.feature_flags;
create policy "Manager: read feature_flags"
  on public.feature_flags for select
  to authenticated
  using (public.is_manager_role('soporte'));

drop policy if exists "Manager: update feature_flags" on public.feature_flags;
create policy "Manager: update feature_flags"
  on public.feature_flags for update
  to authenticated
  using (public.is_manager_role('superadmin'))
  with check (public.is_manager_role('superadmin'));

