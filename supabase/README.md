# Supabase database development and release

`schemas/` is the sole authority for the desired physical database state.
`migrations/` is immutable forward history, and the Supabase CLI migration
ledger is the only release ledger. Production application code never executes
DDL or inspects migration history.

- `pnpm supabase:start` starts the local Supabase stack and Mailpit.
- `pnpm supabase:reset` recreates the local database from committed migrations.
- `pnpm supabase:status` prints local URLs and development-only credentials.
- `supabase/schema-object-map.json` maps every deployed object to an active
  bounded context and records planned contexts that are forbidden in SQL.
- Hosted changes use `supabase db push` only after an isolated Preview branch
  has passed reset, empty diff, integration, browser, RLS, grant, and advisor
  checks.

Change the design handoff and ordered declarative files first, render affected
Mermaid diagrams, then run `pnpm exec supabase db diff -f <change>`. Review the
generated SQL for unexplained drops, data loss, and privilege expansion. CLI
diff caveats use `pnpm exec supabase migration new <change>` and must be entered
in `docs/architecture/data-model/migration-exceptions.md`.

The `20260729103655_support_application_schema` and
`20260730010000_supabase_only_runtime` migrations are immutable compatibility
baselines. The context-schema migration moves their objects into bounded-
context namespaces. `public.support_schema_migrations` remains temporarily for
expand-contract compatibility; a later migration removes it only after every
deployed runtime reads `support_private.schema_contract`.

`20260801120533_normalize_internal_ids_and_project_relations.sql` is an
empty-database, reset-only physical redesign. Its guards reject any Auth user,
Storage object, or product row before dropping context schemas. Never apply it
with `supabase db push` to a populated project. The hosted project must follow
the linked full-reset runbook below, including backup, inventory, maintenance
window, and the exact reset confirmation.

The web runtime connects with the least-privileged `support_web_runtime`
database role. Browser clients use Supabase Auth only and never query product
tables through the Data API. Media objects live in the private
`support-media` bucket and are accessed through server-only package gateways.

## Linked full-reset runbook

The current hosted reset target is `ptdjinrjmojwrbznssqz`. A reset is not a
normal migration operation and must not run as part of an application command.

Before reset:

1. Verify the linked project ref, CLI version, direct or session-pooler port
   `5432` connection, and a maintenance window. Transaction-pooler port `6543`
   is prohibited for reset.
2. Confirm a current restorable backup outside the repository. Export the
   schema and inventory Auth users, Storage buckets/objects, and product row
   counts without printing secrets.
3. Present the exact destructive inventory to the operator and obtain the
   literal confirmation `RESET:ptdjinrjmojwrbznssqz`. Any other response is a
   refusal; do not run the command.
4. Run `pnpm exec supabase db reset --linked`, then recreate only the E2E user
   through the Admin API using environment secrets. Never place credentials in
   SQL, seed data, Git, or logs.

After reset, verify the schema contract, Auth provisioning/email sync triggers,
private `support-media` bucket, active object inventory, constraints, indexes,
forced RLS, grants, private functions, and Supabase security/performance
advisors. Finally run login/logout and all authenticated route Playwright tests.
If any gate fails, stop application deployment and use a reviewed forward fix
or restore procedure; do not edit an applied migration.
