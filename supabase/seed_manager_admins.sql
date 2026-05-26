-- Seed de superadmins para Control Manager (por email).
-- Ejecuta con Supabase CLI / SQL Editor.

do $$
declare
  target_emails text[] := array[
    'deivys1224@gmail.com',
    'empresatecnologicadecolombia@gmail.com'
  ];
begin
  insert into public.manager_roles (user_id, role)
  select u.id, 'superadmin'
  from auth.users u
  where lower(u.email) = any (select lower(e) from unnest(target_emails) as e)
  on conflict (user_id) do update
    set role = excluded.role,
        updated_at = now();
end $$;

