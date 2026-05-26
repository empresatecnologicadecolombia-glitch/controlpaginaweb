-- Ejecuta en Supabase → SQL Editor (proyecto rwyhakcsvdbsavignogh)
-- Añade columnas que el Control Manager usa sobre tu tabla `profiles` existente.

alter table public.profiles
  add column if not exists email text,
  add column if not exists blocked boolean not null default false,
  add column if not exists registration_error text,
  add column if not exists created_at timestamptz default now();

-- Opcional: rellenar email desde auth.users (requiere permisos en SQL Editor)
-- update public.profiles p
-- set email = u.email
-- from auth.users u
-- where p.id = u.id and p.email is null;

-- Políticas para que el panel (rol anon/authenticated) pueda gestionar perfiles.
-- Ajusta según tu seguridad; si ya tienes políticas, revisa que no choquen.

alter table public.profiles enable row level security;

drop policy if exists "Manager: leer profiles" on public.profiles;
create policy "Manager: leer profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Manager: actualizar profiles" on public.profiles;
create policy "Manager: actualizar profiles"
  on public.profiles for update
  using (true)
  with check (true);

drop policy if exists "Manager: eliminar profiles" on public.profiles;
create policy "Manager: eliminar profiles"
  on public.profiles for delete
  using (true);
