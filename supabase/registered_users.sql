-- Ejecuta en Supabase → SQL Editor si aún no tienes la tabla de usuarios.

create table if not exists public.registered_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null,
  email text not null,
  clave text,
  display_name text,
  phone text,
  avatar_url text,
  blocked boolean not null default false,
  registration_error text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

create index if not exists registered_users_email_idx on public.registered_users (email);
create index if not exists registered_users_created_at_idx on public.registered_users (created_at desc);

alter table public.registered_users enable row level security;

-- Ajusta las políticas según quién use el panel (rol authenticated, email concreto, etc.).
create policy "Panel: leer usuarios"
  on public.registered_users for select
  to authenticated
  using (true);

create policy "Panel: actualizar usuarios"
  on public.registered_users for update
  to authenticated
  using (true)
  with check (true);

create policy "Panel: eliminar usuarios"
  on public.registered_users for delete
  to authenticated
  using (true);
