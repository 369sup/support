# ADR-0002: Separate organization teams, roles, and repository grants

- **Status:** Accepted
- **Decision date:** 2026-07-23
- **Supersedes:** none
- **Superseded by:** none

## Context

Organization teams group active organization members, organization roles grant
organization-wide permissions to members or teams, and repository access
combines direct and inherited permission sources. Combining those concepts in
one aggregate would make membership state, team hierarchy, role assignment, and
repository authorization share storage and transaction boundaries.

## Constraints

Each bounded context owns its own records and transaction boundary. Repository
authorization must remain source-attributed. Team hierarchy and role
assignments must not silently create direct memberships or mutate another
context's store.

## Alternatives considered

- Combine team membership, organization roles, and repository grants in one
  aggregate. Rejected because the concepts have different invariants,
  lifecycles, and transaction boundaries.
- Inherit organization roles through the team hierarchy. Rejected because
  hierarchy is used for repository-grant ancestry and does not redefine direct
  team membership.
- Persist a precomputed effective permission as the authority. Rejected because
  it would hide contributing sources and make revocation and policy composition
  harder to reason about.

## Decision

`organizations/organization-teams` owns organization team identity, direct
membership, maintainers, visibility, and an acyclic same-organization parent
hierarchy. Child teams inherit repository grants from their ancestors, but
child members do not become direct members of a parent team. Secret teams do
not participate in nesting.

`organizations/organization-roles` owns immutable predefined role definitions
and assignments to active organization members or active teams. A role assigned
to a team applies only to that team's direct active members; it is not inherited
through the team hierarchy. Custom roles remain planned until feature
entitlements and the fine-grained permission catalog are active.

`repositories/repository-access` owns direct team-to-repository grants and the
effective permission lattice. It reads team and role contributions through
public synchronous contracts, never through another context's store. Dashboard
context remains a navigation scope and never contributes permission.

## Tradeoffs

Independent stores and source-attributed resolution preserve ownership,
revocation semantics, and auditability. The cost is additional synchronous
reads during permission resolution and the possibility of stale references
until reconciliation or durable event handling is implemented.

## Consequences

Team, role, and grant records remain context-local and can be independently
versioned. Organization membership removal, team deletion, or role revocation
immediately stops the relevant contribution when permission is resolved,
without a cross-context write transaction. Stale cross-context references may
remain in process memory until reconciliation or durable event publication is
implemented.

## Migration and rollback

Durable adapters must preserve team ancestry, direct role-assignment semantics,
source-attributed repository decisions, and the existing public contracts. Each
source can be migrated or rolled back independently because no shared
cross-context record is authoritative.

## Follow-up work

Add durable reconciliation and event-driven cleanup for stale references.
Activate custom organization roles only after feature entitlements and the
fine-grained permission catalog are available.
