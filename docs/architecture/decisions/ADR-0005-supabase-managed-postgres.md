# ADR-0005: Use Supabase only as managed PostgreSQL

- **Status:** Accepted
- **Decision date:** 2026-07-28
- **Supersedes:** none
- **Superseded by:** ADR-0006

## Context

The production runtime needs durable accounts, credentials, and sessions across
process restarts and multi-instance deployments. Supabase can provide managed
PostgreSQL, but adopting Supabase Auth, its Data API, or its SDKs would move
identity and persistence contracts outside their existing bounded contexts.
Supabase also exposes direct, session-pooler, and transaction-pooler endpoints
with different deployment uses.

## Decision

Use Supabase only as a managed PostgreSQL provider. Add the server-only
`@support/supabase` runtime package to validate Supabase PostgreSQL endpoints,
connection modes, and TLS policy before constructing the provider-neutral
`PostgresDatabase` from `@support/database`.

`@support/supabase` owns no product tables, migrations, RLS policies,
environment parsing, authentication, authorization, tenant rules, or data
lifecycle. Bounded contexts retain their TypeScript migration arrays and
persistence adapters as the only schema authority. The web application selects
generic PostgreSQL or Supabase-managed PostgreSQL at composition time.

All public `support_*` tables enable PostgreSQL row-level security without
`anon` or `authenticated` policies. Server-side PostgreSQL connections remain
the only product data path. Supabase Auth, the Data API, and `@supabase/*`
packages are not used.

## Consequences

Production requires a secure PostgreSQL connection string, explicit endpoint
mode, TLS, and the existing authentication encryption key. Local development
may use the session pooler; serverless production may use the transaction
pooler because repository queries do not use named prepared statements.

Account and identity-transaction state is durable and coordinated with database
transactions, row locks, unique constraints, and username-scoped advisory
locks. Preview deployments remain memory-backed unless they are explicitly
given an isolated database. Rollback changes the deployment/runtime selection;
additive tables are retained and are not destructively removed.
