# Declarative Migration Exceptions

This register records changes that cannot be represented completely by the
installed Supabase CLI declarative diff. An empty register means no exception
has been approved; it does not mean the CLI has no known caveats.

| ID | Status | Object | Caveat | Forward migration | Verification |
| --- | --- | --- | --- | --- | --- |
| DB-EX-001 | Accepted | Context-schema relocation and grants | Schema moves, role attributes, grants, policy replacement, trigger ownership, and contract DML require ordered forward SQL | `20260801101856_context_schema_contract.sql` | empty reset, privilege inspection, RLS tests, and scoped follow-up diff |
| DB-EX-002 | Accepted, reset-only | UUID internal IDs and normalized project relations | CLI 2.110.0 generated unsafe constraint-backed index drops for the redesign. The reviewed replacement refuses non-empty Auth, Storage, and product data before recreating the physical model | `20260801120533_normalize_internal_ids_and_project_relations.sql` | guard inspection, empty local reset, exact object inventory, and empty `pg-delta` follow-up diff |
| DB-EX-003 | Accepted | Schema contract row | Declarative diff does not capture DML. The reset-only migration explicitly upserts `support-web` at `2026-08-01.v1` after recreating `support_private` | `20260801120533_normalize_internal_ids_and_project_relations.sql` | runtime-role select and exact contract version query |
| DB-EX-004 | Accepted | Orchestration-only schemas, grants, and RLS policies | CLI 2.110.0 does not completely capture schema privileges, default privileges, or policy alteration. Reviewed SQL explicitly revokes browser and service roles and retains only `support_web_runtime_only` | `20260801120533_normalize_internal_ids_and_project_relations.sql` | namespace ACL, table grants, forced RLS, policy comparison, function ACL, and advisors |

New exceptions must state why declarative SQL alone is insufficient, the exact
objects affected, data-loss and privilege impact, rollback/forward recovery,
and a discriminating verification query.
