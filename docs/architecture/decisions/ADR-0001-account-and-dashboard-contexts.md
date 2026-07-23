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

## Consequences

Account switching and Dashboard context switching remain distinct operations.
Cross-context coordination uses public synchronous contracts and no distributed
transaction. Process restart safely invalidates cookies, and production or
ordinary Preview deployments have no in-memory sign-in runtime.

Team access, organization base permission, custom roles, enterprise policies,
real IdP/SSO, durable storage, and cross-instance consistency remain planned.
