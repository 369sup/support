# ADR-0007: Use one declarative database schema authority

- **Status:** Accepted
- **Decision date:** 2026-08-01
- **Supersedes:** ADR-0006
- **Superseded by:** none

## Context

The repository accumulated two migration systems: immutable SQL under
`supabase/migrations` and bounded-context TypeScript migration arrays tracked by
`public.support_schema_migrations`. Request-time adapters also verified subsets
of that custom ledger. The duplicate authorities can disagree, make a fresh
database depend on application code, and report a schema problem only after a
user request has started.

The GitHub non-code atlas defines product evidence and logical semantics but is
deliberately not a physical schema. A separate, traceable database-design
handoff is required before SQL is generated.

## Decision

`docs/architecture/data-model` owns the database-design handoff from atlas
requirements to active bounded contexts. An unresolved physical decision is a
hard stop: it cannot be represented in SQL.

`supabase/schemas/*.sql`, in the explicit order declared by
`supabase/config.toml`, is the only authority for the desired physical state.
Only active contexts from `module-map.json` may own product objects there.
`supabase/migrations/*.sql` is the immutable forward history, and the Supabase
CLI migration ledger is the only release ledger. Declarative changes are
normally emitted with `supabase db diff`; documented CLI diff gaps use an
explicit forward migration.

The server-only role is `support_web_runtime`. Product schemas grant no access
to `PUBLIC`, `anon`, `authenticated`, or `service_role`; forced RLS remains
defense in depth. Private `SECURITY DEFINER` functions have an empty
`search_path`, no PUBLIC execution, and an explicit runtime or system grant.

Runtime readiness is one comparison against
`support_private.schema_contract`. It runs when the production database runtime
is composed, before route work begins. Bounded-context adapters do not run DDL
and do not inspect migration history.

## Consequences

TypeScript migration arrays, their runner, and the custom migration ledger are
retired using expand-contract sequencing. First, the schema contract and the
new runtime check are deployed. Only a later forward migration may drop
`public.support_schema_migrations`, after no deployed application depends on
it.

Every database change updates the design handoff and affected Mermaid diagrams,
changes declarative SQL, reviews the generated migration, rebuilds an empty
local Supabase database, and confirms a subsequent diff is empty. DML, policy
alterations, view ownership, publications, and other documented diff caveats
must be identified in the migration exception register rather than hidden.

A linked reset is a destructive release operation. It requires a current
backup, an Auth/Storage/product-data inventory, a maintenance window, and the
exact project confirmation token recorded in the runbook.
