# GitHub Non-Code Product Semantics Atlas

## Purpose

Audience: product architects, domain modelers, and Codex agents preparing a
GitHub-like collaboration platform without Git or code-development workflows.

This atlas derives a reconstruction model from current GitHub documentation.
Its product-semantic authority is the official source register in
[`source-register.md`](source-register.md). It does not claim to describe
GitHub's private implementation, and it does not change this repository's
canonical architecture or activate any runtime module.

## Scope boundary

The atlas includes:

- personal accounts, authentication boundaries, profiles, and dashboards;
- enterprises, organizations, memberships, invitations, roles, and teams;
- repository ownership, metadata, visibility, access, policy, and lifecycle;
- Issues, Discussions, Projects, notifications, subscriptions, stars, follows,
  activity, non-code search, moderation, and audit;
- the interactions among those capabilities.

The task boundary excludes Git objects, repository file contents, commits,
branches, tags, diffs, pull requests, review and merge workflows, Actions,
packages, Codespaces, Pages, and releases. Where official documentation says an
excluded capability affects retained metadata, the atlas records only that
observable effect.

Authentication providers, email delivery, search indexing, and audit export are
system boundaries. Detailed billing, application integration, sponsorship,
security-product, and Wiki behavior is not modeled in this first atlas.

## First-principles method

Every modeled behavior follows this chain:

1. Record an observable statement from `docs.github.com`.
2. Separate the stable invariant from plan-specific or preview behavior.
3. Derive actors, resources, relationships, states, permissions, and events.
4. Represent the derivation in the smallest suitable Mermaid diagram.
5. Mark target-architecture choices as inference rather than GitHub fact.
6. Trace implementation work back to a requirement and official source ID.

The confidence vocabulary is:

- **Confirmed**: directly stated by a registered GitHub Docs source.
- **Derived**: the smallest model that satisfies several confirmed statements.
- **Unresolved**: documentation is silent, preview-only, plan-dependent, or
  insufficient to select one implementation.

Existing Support source, architecture documents, and memories were not used as
evidence for GitHub product semantics. They were consulted only for repository
placement and documentation workflow.

## Diagram chain

| Order | Diagram | Responsibility |
| --- | --- | --- |
| 1 | [Requirements traceability](01-requirements-traceability.md) | Defines the reconstruction obligations and their model owners. |
| 2 | [System context and containers](02-system-context.md) | Fixes actors, product boundary, external systems, and exclusions. |
| 3 | [Conceptual domain ERD](03-domain-erd.md) | Defines product concepts and relationship ownership. |
| 4 | [Lifecycle states](04-lifecycle-states.md) | Defines independently verifiable state transitions. |
| 5 | [Authorization decisions](05-authorization.md) | Defines how policy, roles, grants, object rules, and state guards combine. |
| 6 | [Core interaction sequences](06-core-sequences.md) | Defines representative end-to-end success and failure paths. |
| 7 | [Reconstruction architecture](07-reconstruction-architecture.md) | Maps semantics into a target implementation without claiming GitHub internals. |
| 8 | [Logical navigation](08-logical-navigation.md) | Defines reachable product destinations without fixing literal URLs. |

## How Codex should use this atlas

For a feature slice, Codex should start at the requirement ID, follow its
evidence IDs into the source register, select the relevant domain entities and
state transitions, then apply the authorization and sequence diagrams. The
architecture and navigation diagrams constrain placement and presentation only
after the product behavior is understood.

The diagrams are not a physical database schema, route contract, OpenAPI
contract, or complete acceptance suite. Before implementation, a slice still
needs:

- field-level data definitions and validation;
- command/query and error contracts;
- acceptance cases for every permitted and forbidden transition;
- plan and deployment assumptions;
- an explicit decision for every unresolved item.

## Verification

All eight Mermaid blocks were rendered with Mermaid Chart on 2026-07-29.
Product source links were restricted to HTTPS pages under `docs.github.com`.
Repository verification must additionally check Markdown links, Mermaid syntax,
the actual diff, and `git diff --check`.
