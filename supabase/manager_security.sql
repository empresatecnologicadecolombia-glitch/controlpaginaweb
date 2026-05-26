-- Seguridad para Control Manager (roles + auditoría).
-- Ejecuta en Supabase → SQL Editor.

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

-- Helper: valida rol del usuario autenticado.
create or replace function public.is_manager_role(required_role text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.manager_roles r
    where r.user_id = auth.uid()
      and (
        r.role = required_role
        or r.role = 'superadmin'
      )
  );
$$;

-- Roles: lectura solo para managers; escritura solo superadmin.
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

-- Auditoría: lectura para managers; inserción para managers; nada de update/delete.
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

-- Opcional: seed de roles (ajusta user_id reales).
-- insert into public.manager_roles (user_id, role) values
--   ('<uuid_de_DavisH>', 'superadmin'),
--   ('<uuid_de_Davis2>', 'superadmin')
-- on conflict (user_id) do update set role = excluded.role, updated_at = now();

