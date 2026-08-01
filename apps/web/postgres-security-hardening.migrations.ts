import type { PostgresMigration } from "@support/database/postgres";

export const postgresSecurityHardeningMigrations: readonly PostgresMigration[] =
  [
    {
      id: "zz999_security_hardening",
      sql: `
        do $$
        declare
          table_row record;
          policy_row record;
        begin
          for table_row in
            select schemaname, tablename
              from pg_tables
             where schemaname = 'public'
               and tablename like 'support\\_%' escape '\\'
          loop
            execute format(
              'alter table %I.%I enable row level security',
              table_row.schemaname,
              table_row.tablename
            );
            execute format(
              'revoke all privileges on table %I.%I from public',
              table_row.schemaname,
              table_row.tablename
            );
            if exists (select 1 from pg_roles where rolname = 'anon') then
              execute format(
                'revoke all privileges on table %I.%I from anon',
                table_row.schemaname,
                table_row.tablename
              );
            end if;
            if exists (
              select 1 from pg_roles where rolname = 'authenticated'
            ) then
              execute format(
                'revoke all privileges on table %I.%I from authenticated',
                table_row.schemaname,
                table_row.tablename
              );
            end if;
          end loop;

          for policy_row in
            select schemaname, tablename, policyname
              from pg_policies
             where schemaname = 'public'
               and tablename like 'support\\_%' escape '\\'
          loop
            execute format(
              'drop policy %I on %I.%I',
              policy_row.policyname,
              policy_row.schemaname,
              policy_row.tablename
            );
          end loop;

          if to_regprocedure('public.rls_auto_enable()') is not null then
            revoke execute on function public.rls_auto_enable() from public;
            if exists (select 1 from pg_roles where rolname = 'anon') then
              revoke execute on function public.rls_auto_enable() from anon;
            end if;
            if exists (
              select 1 from pg_roles where rolname = 'authenticated'
            ) then
              revoke execute on function public.rls_auto_enable()
                from authenticated;
            end if;
          end if;
        end
        $$;
      `,
    },
  ];
