# ADR-0004: Add provider-neutral production runtime adapters

- **Status:** Accepted
- **Decision date:** 2026-07-28
- **Supersedes:** none
- **Superseded by:** none

## Context

ADR-0003 preserves correct ownership and event boundaries in a deterministic
process-local runtime, but that runtime cannot provide restart durability,
multi-instance coordination, reliable expiration, or production credential
storage. The product also needs external identity, mail, and billing
integrations without allowing any provider SDK to define domain contracts.

## Decision

Keep the existing in-memory adapters for development and isolated tests. Add a
business-free `@support/database` package that provides one node-postgres pool,
single-connection transactions, and checksum-guarded migrations. Every bounded
context continues to own its tables, migrations, repository ports, optimistic
concurrency, retention, and event semantics.

Use standards-based provider boundaries:

- OpenID Connect, SAML, and SCIM remain protocol ports selected by application
  composition.
- SMTP is the production email transport.
- Billing domain contracts remain provider-neutral; a Stripe adapter may use
  Billing and Checkout APIs without exposing Stripe types to inner layers.

Configuration is validated at the web application boundary. Secrets are
runtime-only; `.env.example` contains names, safe examples, and empty
placeholders only. Provider calls never occur while a database transaction
holds locks.

ADR-0003 is not superseded: its context-local outbox, idempotent consumer,
eventual-consistency, and authorization-ordering decisions continue to apply
to both runtime modes.

## Consequences

Production deployments require PostgreSQL migrations and explicit runtime
configuration. Operational complexity and dependency surface increase, but
domain ownership remains independent of vendors. In-memory mode remains
non-durable and must never be presented as production-safe. Migration rollback
is adapter selection plus context-owned down or forward migrations; it does not
permit cross-context table access.
