-- Forward exception DB-EX-005. See
-- docs/architecture/data-model/migration-exceptions.md.
--
-- The application now checks support_private.schema_contract, and the hosted
-- runtime was verified before this migration was released. PostgreSQL's
-- default RESTRICT behavior keeps this retirement fail-closed if an
-- unexpected database object still depends on the legacy ledger.
drop table if exists public.support_schema_migrations;
