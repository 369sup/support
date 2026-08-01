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

## GitHub non-code semantics

Product evidence, requirements, logical models, and Mermaid change rules live
under [`github-non-code/`](github-non-code/README.md). Follow its
[`AGENTS.md`](github-non-code/AGENTS.md) for that subtree. Top-level governance
documents route to the atlas and must not copy its source register, diagrams,
capability matrix, or implementation checklist.
