# ADR-0001: Separate account sessions, Dashboard context, and enterprise administration

- **Status:** Accepted
- **Decision date:** 2026-07-23
- **Supersedes:** none
- **Superseded by:** none

## Context

The product needs multiple retained user-account sessions, personal and
organization Dashboard views, enterprise administration, and repository access
without treating organizations or enterprises as authenticating accounts.
Selected navigation scope must not become an authorization grant, and
enterprise organization ownership must have one source of truth.

## Constraints

The current implementation uses context-local, process-local persistence and is
enabled only in development or an explicit E2E runtime. Organizations and
enterprises do not authenticate as user accounts. Dashboard navigation state
must not grant repository or enterprise administration permission.

## Alternatives considered

- Treat organizations and enterprises as authenticating principals. Rejected
  because it would merge resource ownership with user identity and session
  semantics.
- Use the selected Dashboard context as an authorization source. Rejected
  because navigation state is caller-controlled presentation state, not verified
  membership or permission evidence.
- Store sessions, Dashboard selection, enterprise ownership, and repository
  access in one shared model. Rejected because it would erase bounded-context
  ownership and transaction boundaries.

## Decision

`identity/authentication` owns the browser session set and active account
session. User accounts are personal or managed; machine is account usage.

`projections/dashboard` owns a session-keyed context that is either personal or
organization. After account-session activation, the application restores that
session's last context, revalidates organization membership and lifecycle, and
persists a personal fallback when invalid. Enterprise is never a Dashboard
context.

`enterprises/enterprises` owns enterprise-to-organization links.
`enterprises/enterprise-roles` separately decides access to enterprise
administration. `repositories/repository-access` independently resolves every
private or internal repository view from source-attributed grants and owner
authority; Dashboard selection is never a permission source.

All current persistence is context-local, process-local, and enabled only in
development or an explicit E2E runtime. Route Handlers identify the browser set
with an opaque HttpOnly cookie and enforce same-origin mutations.

## Tradeoffs

Separating the concepts preserves explicit ownership and prevents navigation
state from becoming authorization evidence. The cost is additional public
cross-context contracts and repeated lifecycle and membership validation when a
session or Dashboard context is restored.

## Consequences

Account switching and Dashboard context switching remain distinct operations.
Cross-context coordination uses public synchronous contracts and no distributed
transaction. Process restart safely invalidates cookies, and production or
ordinary Preview deployments have no in-memory sign-in runtime.

Team access, organization base permission, custom roles, enterprise policies,
real IdP/SSO, durable storage, and cross-instance consistency remain planned.

## Migration and rollback

A durable authentication or persistence adapter must preserve the public
session, Dashboard-context, enterprise-ownership, and repository-access
contracts. Until durable production adapters exist, rollback consists of
disabling the replacement adapter and retaining the in-memory runtime for
development and E2E only. No production data migration is currently required.

## Follow-up work

Implement durable storage, real IdP/SSO integration, cross-instance session
consistency, organization base permissions, team access, custom roles, and
enterprise policies as separately owned capabilities.
