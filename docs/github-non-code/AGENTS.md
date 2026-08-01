# GitHub Non-Code Product-Semantics Workflow

This file governs `docs/github-non-code/**` and adds only the delta to
[`docs/AGENTS.md`](../AGENTS.md).

## Authority and boundary

- [`README.md`](README.md) is the atlas index and usage contract.
- [`source-register.md`](source-register.md) is the only product-evidence
  register. Product-semantic claims must trace to current HTTPS pages under
  `docs.github.com`; repository source, existing designs, memories, and inferred
  GitHub internals are not substitutes.
- The atlas is research input. It does not supersede
  [`docs/architecture/architecture.md`](../architecture/architecture.md),
  activate a planned context, or define a physical schema, API, literal route,
  migration, or complete acceptance contract.
- Keep Git objects, code contents, commits, branches, diffs, pull requests,
  review and merge workflows, Actions, and the other exclusions in
  [`README.md`](README.md) outside the model.

## Context routing

Start with the affected requirement in
[`01-requirements-traceability.md`](01-requirements-traceability.md), then read
only the evidence IDs and diagrams needed for the slice:

| Question | Diagram |
| --- | --- |
| Actors, external systems, scope, or exclusions | [`02-system-context.md`](02-system-context.md) |
| Concepts, ownership, or relationship cardinality | [`03-domain-erd.md`](03-domain-erd.md) |
| States, transitions, or forbidden transitions | [`04-lifecycle-states.md`](04-lifecycle-states.md) |
| Roles, grants, policy, visibility, or state guards | [`05-authorization.md`](05-authorization.md) |
| Commands, failures, events, notifications, or audit effects | [`06-core-sequences.md`](06-core-sequences.md) |
| Module placement, consistency, or projection boundaries | [`07-reconstruction-architecture.md`](07-reconstruction-architecture.md) |
| Reachability or presentation destinations | [`08-logical-navigation.md`](08-logical-navigation.md) |

Stop once the affected actors, resources, states, authorization, paths, side
effects, and unresolved variants are known.

## Change rules

- Preserve the meanings of **Confirmed**, **Derived**, and **Unresolved** from
  the index. Do not promote inference or plan-specific behavior to confirmed
  fact.
- Give every new product-semantic claim a source ID in
  [`source-register.md`](source-register.md), and use that ID wherever the claim
  is represented.
- Update prose, Mermaid, requirement traceability, and source references
  together. A diagram must not become a second, contradictory source of truth.
- Express semantic relationships and observable behavior; leave field types,
  endpoints, literal URLs, storage choices, and framework details to their
  owning contracts.
- Reverify affected GitHub Docs when a source is preview, plan-dependent,
  account-dependent, deployment-dependent, or plausibly changed.
- When repository architecture cannot represent a verified behavior, record the
  mapping gap or unresolved decision instead of silently changing either model.

## Implementation handoff

Before implementation, record actors/ownership, preconditions, independent
states, authorization and denied cases, interaction failures, side effects, and
unresolved variants.

Map it to architecture, the active catalog, public contracts, and tests. Do not
infer missing contracts from diagrams.

## Verification

- Render every changed Mermaid block with Mermaid Chart.
- Check source hosts, source IDs, local links, and diagram-to-prose consistency.
- Run `pnpm.cmd governance:knowledge` and `pnpm.cmd architecture`.
- Inspect the actual diff and run `git diff --check`; report any validation that
  could not run.
