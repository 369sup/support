-- Forward exception DB-EX-001: PostgreSQL roles are not represented reliably by
-- the declarative schema diff. This migration must precede runtime grants and
-- is intentionally safe when the hosted login role already exists.
do $$
begin
  if not exists (
    select 1
    from pg_roles
    where rolname = 'support_web_runtime'
  ) then
    create role support_web_runtime nologin nosuperuser nocreatedb
      nocreaterole noinherit noreplication nobypassrls;
  end if;

  if exists (
    select 1
    from pg_roles
    where rolname = 'support_web_runtime'
      and (rolsuper or rolbypassrls)
  ) then
    raise exception
      'support_web_runtime must not be superuser or bypass row level security';
  end if;
end
$$;
