# Architecture Decision Records

This directory records the small set of decisions that materially constrain
the repository architecture. The canonical trigger list is in
[`../architecture.md`](../architecture.md).

## Lifecycle

- `Proposed`: under review and not authoritative.
- `Accepted`: approved and authoritative from its decision date.
- `Rejected`: considered and explicitly not adopted.
- `Superseded`: replaced by another accepted ADR; both records link to each
  other.

Valid transitions are `Proposed -> Accepted`, `Proposed -> Rejected`, and
`Accepted -> Superseded`. Rejected and superseded records remain as history.
Do not rewrite an accepted decision to express a new choice; create a
replacement ADR and supersede the old record.

## Naming and index

Name records `ADR-0001-short-title.md` with a monotonically increasing
four-digit number. Add each record to the table below.

| ADR | Status | Decision |
| --- | --- | --- |
| [ADR-0001](ADR-0001-account-and-dashboard-contexts.md) | Accepted | Separate account sessions, Dashboard context, and enterprise administration. |
| [ADR-0002](ADR-0002-organization-team-and-role-access.md) | Accepted | Keep team hierarchy, organization roles, and repository grants as separate authorization sources. |

## Template

```markdown
# ADR-0001: Short decision title

- **Status:** Proposed | Accepted | Rejected | Superseded
- **Decision date:** YYYY-MM-DD | pending
- **Supersedes:** none | ADR-####
- **Superseded by:** none | ADR-####

## Context

Describe the forces, constraints, and concrete problem.

## Decision

State the chosen architecture and its boundary.

## Consequences

Record benefits, costs, operational effects, migration needs, and follow-up
work.
```
