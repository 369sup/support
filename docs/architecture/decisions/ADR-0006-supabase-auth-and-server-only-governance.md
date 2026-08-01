# ADR-0006: Use Supabase Auth with server-only governance data

- **Status:** Accepted
- **Decision date:** 2026-07-28
- **Supersedes:** ADR-0005
- **Superseded by:** none

## Context

Support needs durable authentication and GitHub-like non-code governance across
server restarts and multi-instance deployments. Keeping password credentials,
browser sessions, and recovery factors in the application duplicates a managed
identity provider. At the same time, browser access to product tables would
bypass bounded-context use cases and their authorization decisions.

Product behavior is defined only by the GitHub Docs pages recorded in
`github-governance-feature-matrix.md`. Supabase documentation governs only the
Auth, cookie, and PostgreSQL integration.

## Decision

Supabase Auth owns password signup, email confirmation, password login, token
refresh, logout, recovery, and password changes. The web application uses
request-scoped `@supabase/ssr` clients. Proxy refresh validates claims before
forwarding identity, and server code never authorizes from an unverified local
session or user metadata.

An authentication-owned external identity binding maps the Supabase
`auth.users.id` subject to the provider-neutral Support account ID. A restricted
database trigger provisions the Support account, identity binding, and verified
primary email state. User metadata may carry the requested username into this
provisioning transaction, but never roles, permissions, policy, or tenant data.

Enterprise, organization, team, repository, role, policy, custom-property, and
audit data remain server-only. Next.js routes call bounded-context use cases,
whose PostgreSQL adapters use the application database connection. Browser
Data API access is not a product data path. Every public `support_*` table has
RLS enabled, no browser-role policy, and no privileges for `anon` or
`authenticated`.

Migrations are repository-owned TypeScript migrations and run as an explicit
release command. Request-time adapters only verify the required schema version.
Local and Preview environments use an isolated non-production Supabase project
or the development-memory provider; Production is not configured until the
non-production verification gates pass.

## Consequences

Supabase and Next.js types remain in technical adapters. Product modules expose
provider-neutral accounts and authenticated-session views. Login accepts an
email address directly or resolves a username to the verified primary email
before calling Supabase Auth; all failures use a generic response.

The custom credential, browser-session, 2FA, passkey, sudo, and account-switching
tables remain read-only compatibility data during the transition and are not
used by the Supabase composition. Their removal requires a separate migration
after the compatibility window.

Rollback restores the preceding deployment and environment selection. Additive
product tables and append-only audit records are retained.
