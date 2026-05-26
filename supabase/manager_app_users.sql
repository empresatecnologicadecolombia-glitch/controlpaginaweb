-- Usuarios y contraseñas SOLO para OnniVers Control Manager (no Auth de Supabase).
-- Ejecuta en Supabase → SQL Editor (o: supabase db execute -f supabase/manager_app_users.sql)

create extension if not exists "pgcrypto";

create table if not exists public.manager_app_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  display_name text,
  role text not null default 'superadmin'
    check (role in ('superadmin', 'moderador', 'soporte')),
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists manager_app_users_email_lower_idx
  on public.manager_app_users (lower(email));

alter table public.manager_app_users enable row level security;

-- Nadie lee la tabla directamente; solo la función de login.
revoke all on table public.manager_app_users from anon, authenticated;
grant all on table public.manager_app_users to service_role;

create or replace function public.manager_app_login(p_email text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.manager_app_users%rowtype;
begin
  if p_email is null or trim(p_email) = '' or p_password is null or p_password = '' then
    return jsonb_build_object('ok', false, 'message', 'Correo y contraseña requeridos');
  end if;

  select *
  into v_row
  from public.manager_app_users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  if not found or not v_row.active then
    return jsonb_build_object('ok', false, 'message', 'Credenciales incorrectas');
  end if;

  if v_row.password_hash is distinct from crypt(p_password, v_row.password_hash) then
    return jsonb_build_object('ok', false, 'message', 'Credenciales incorrectas');
  end if;

  update public.manager_app_users
  set last_login_at = now(), updated_at = now()
  where id = v_row.id;

  return jsonb_build_object(
    'ok', true,
    'user', jsonb_build_object(
      'id', v_row.id,
      'email', v_row.email,
      'displayName', coalesce(v_row.display_name, split_part(v_row.email, '@', 1)),
      'role', v_row.role
    )
  );
end;
$$;

revoke all on function public.manager_app_login(text, text) from public;
grant execute on function public.manager_app_login(text, text) to anon, authenticated;

-- Cuentas iniciales (contraseña: abcd1234)
insert into public.manager_app_users (email, password_hash, display_name, role)
select v.email, v.password_hash, v.display_name, v.role
from (values
  ('deivys1224@gmail.com', crypt('abcd1234', gen_salt('bf')), 'Deivys', 'superadmin'),
  ('empresatecnologicadecolombia@gmail.com', crypt('abcd1234', gen_salt('bf')), 'Admin Colombia', 'superadmin')
) as v(email, password_hash, display_name, role)
where not exists (
  select 1 from public.manager_app_users u where lower(u.email) = lower(v.email)
);

-- Permisos del panel con anon key (login validado en la app vía manager_app_login)
drop policy if exists "Manager app panel: leer profiles" on public.profiles;
create policy "Manager app panel: leer profiles"
  on public.profiles for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: actualizar profiles" on public.profiles;
create policy "Manager app panel: actualizar profiles"
  on public.profiles for update to anon, authenticated using (true) with check (true);

drop policy if exists "Manager app panel: eliminar profiles" on public.profiles;
create policy "Manager app panel: eliminar profiles"
  on public.profiles for delete to anon, authenticated using (true);

drop policy if exists "Manager app panel: leer registered_users" on public.registered_users;
create policy "Manager app panel: leer registered_users"
  on public.registered_users for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: actualizar registered_users" on public.registered_users;
create policy "Manager app panel: actualizar registered_users"
  on public.registered_users for update to anon, authenticated using (true) with check (true);

drop policy if exists "Manager app panel: eliminar registered_users" on public.registered_users;
create policy "Manager app panel: eliminar registered_users"
  on public.registered_users for delete to anon, authenticated using (true);

drop policy if exists "Manager app panel: leer concerts" on public.concerts;
create policy "Manager app panel: leer concerts"
  on public.concerts for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: escribir concerts" on public.concerts;
create policy "Manager app panel: escribir concerts"
  on public.concerts for all to anon, authenticated using (true) with check (true);

drop policy if exists "Manager app panel: leer streams" on public.streams;
create policy "Manager app panel: leer streams"
  on public.streams for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: escribir streams" on public.streams;
create policy "Manager app panel: escribir streams"
  on public.streams for all to anon, authenticated using (true) with check (true);

drop policy if exists "Manager app panel: leer feature_flags" on public.feature_flags;
create policy "Manager app panel: leer feature_flags"
  on public.feature_flags for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: escribir feature_flags" on public.feature_flags;
create policy "Manager app panel: escribir feature_flags"
  on public.feature_flags for all to anon, authenticated using (true) with check (true);

drop policy if exists "Manager app panel: leer admin_audit_log" on public.admin_audit_log;
create policy "Manager app panel: leer admin_audit_log"
  on public.admin_audit_log for select to anon, authenticated using (true);

drop policy if exists "Manager app panel: insert admin_audit_log" on public.admin_audit_log;
create policy "Manager app panel: insert admin_audit_log"
  on public.admin_audit_log for insert to anon, authenticated with check (true);

drop policy if exists "Manager app panel: leer chat_messages" on public.chat_messages;
create policy "Manager app panel: leer chat_messages"
  on public.chat_messages for select to anon, authenticated using (true);
