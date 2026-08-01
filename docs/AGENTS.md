# Documentation Workflow

This file governs `docs/**` and applies the repository guidance in
[`../AGENTS.md`](../AGENTS.md). More specific instructions in
[`architecture/AGENTS.md`](architecture/AGENTS.md) add only that subtree's
delta.

## Start with ownership

- Use [`README.md`](README.md) for task routing and
  [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) to identify the owning contract.
- Use [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) for top-level identity, lifecycle,
  owner, dependency, and validation metadata.
- Read only the nearest guidance and authority needed for the target path.

## Documentation rules

- Name the audience, authority, owner, update trigger, and verification path.
- Link to canonical rules instead of copying product, architecture, route,
  schema, dependency, or workflow contracts.
- Keep examples explicitly non-normative and separate current state, accepted
  decisions, history, and future intent.
- Update affected map, index, decision, changelog, and dependency records when
  their registered triggers apply.
- Record unverified claims and missing ownership as gaps; do not invent status,
  evidence, implementation, or operational readiness.
- Use owner generators for generated documents and never edit projections
  directly.
- Keep commands aligned with repository scripts and exclude secrets, personal
  paths, customer data, and personal information.

## Validation

Follow [`VALIDATION.md`](VALIDATION.md), review the actual diff and links, and
report passed, failed, skipped, and unavailable checks separately. Run the
smallest relevant repository check and expand only when the affected authority
or initial result requires it.

## Integrated GitHub non-code semantics

The top-level documentation set also owns the integrated GitHub non-code
product-semantic research model. Start with the affected requirement in
[`DOCUMENT-MAP.md`](DOCUMENT-MAP.md), then read only the evidence IDs and views
needed for the slice:

| Question | Document |
| --- | --- |
| Actors, external systems, scope, authorization, reconstruction, or logical navigation | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Concepts, ownership, or relationship cardinality | [`SCHEMA.md`](SCHEMA.md) |
| States, transitions, commands, failures, notifications, or audit effects | [`WORKFLOWS.md`](WORKFLOWS.md) |
| Official product evidence and verification state | [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) |

- Preserve **Confirmed**, **Derived**, and **Unresolved** as defined in
  [`CLASSIFICATION.md`](CLASSIFICATION.md); never promote inference or
  plan-specific behavior to confirmed fact.
- Give every new product-semantic claim a registered `GH-*` source ID and use
  that ID wherever the claim is modeled.
- Update requirement traceability, prose, Mermaid, evidence references, and
  affected examples together. A diagram is not an independent source of truth.
- Express observable behavior and semantic relationships; leave physical field
  types, endpoints, literal URLs, storage choices, and framework details to
  their owning contracts.
- Reverify affected GitHub Docs when a source is preview, plan-dependent,
  account-dependent, deployment-dependent, unavailable, or plausibly changed.
- Record architecture mapping gaps and unresolved choices instead of silently
  changing either the product model or canonical Support architecture.
- Keep Git objects, code contents, commits, branches, diffs, pull requests,
  review and merge workflows, Actions, and the exclusions in
  [`README.md`](README.md) outside the model.

Before implementing or reviewing a semantic slice, cover actors and ownership,
preconditions and independent states, authorization and denials, success and
failure paths, side effects, and unresolved variants. Then map the checklist to
the active module catalog, public entrypoints, contracts, and tests. Do not infer
missing contracts from diagrams.
