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

## Consequences

Team, role, and grant records remain context-local and can be independently
versioned. Organization membership removal, team deletion, or role revocation
immediately stops the relevant contribution when permission is resolved,
without a cross-context write transaction. Stale cross-context references may
remain in process memory until reconciliation or durable event publication is
implemented.
