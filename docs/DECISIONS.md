# Documentation Governance Decisions

This log records accepted decisions about the top-level documentation governance
system. It does not replace the technical architecture decision records in
[`architecture/decisions/README.md`](architecture/decisions/README.md).

## DOC-DEC-001: Establish a documentation governance layer

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** The 21 top-level documents govern documentation discovery,
  authority, classification, lifecycle, and maintenance. They do not redefine
  product semantics, technical architecture, routes, schemas, or dependencies.
- **Rationale:** The repository already has canonical owners for those concerns;
  a second summary contract would create conflicting authority.
- **Consequences:** Governance documents link to existing owners and stay
  concise. Readers must follow the authority matrix for substantive decisions.

## DOC-DEC-002: Use English and stable repository-relative names

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Governance content is written in English. Requested top-level
  control files use `UPPER-KEBAB-CASE.md`; conventional and existing subtree
  names remain unchanged. Links are repository-relative.
- **Rationale:** This matches the repository's existing engineering language and
  keeps paths portable across development environments.
- **Consequences:** Translation is not maintained as a parallel authority.

## DOC-DEC-003: Keep metadata in the document map

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Version 1 stores logical metadata in
  [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) and does not require YAML front matter.
- **Rationale:** Existing documents do not use a common front-matter contract,
  and retrofitting them would expand scope without an enforcement mechanism.
- **Consequences:** Changes to a registered document's identity, ownership,
  lifecycle, or relationships must update the document map in the same change.

## DOC-DEC-004: Begin with a documentation-only validation baseline

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Version 1 uses existing repository checks plus explicit structural
  and link review. It adds no validator, dependency, package command, or CI gate.
- **Rationale:** The initial goal is to establish a coherent contract with the
  smallest change surface before automating stable rules.
- **Consequences:** Maintainers perform the checklist in
  [`VALIDATION.md`](VALIDATION.md). Automation remains a roadmap candidate, not
  a current capability.

## DOC-DEC-005: Integrate the GitHub non-code semantic model

- **Status:** Superseded by DOC-DEC-007
- **Date:** 2026-08-01
- **Decision:** Move the complete GitHub non-code requirements, evidence
  register, conceptual model, lifecycles, authorization flow, interaction
  sequences, reconstruction architecture, and logical navigation into the 21
  top-level documentation authorities, then remove the former
  `docs/product-semantics/github-non-code` path.
- **Rationale:** One integrated documentation entrypoint reduces navigation and
  maintenance duplication while preserving requirement and source traceability.
- **Consequences:** [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) becomes the
  product-evidence register; [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md),
  [`ARCHITECTURE.md`](ARCHITECTURE.md), [`SCHEMA.md`](SCHEMA.md), and
  [`WORKFLOWS.md`](WORKFLOWS.md) own the migrated semantic views. Old paths are
  removed rather than retained as competing compatibility copies.

## DOC-DEC-006: Keep reconstruction choices derived

- **Status:** Superseded by DOC-DEC-007
- **Date:** 2026-08-01
- **Decision:** The deterministic authorization ordering, modular-monolith
  reconstruction, transactional outbox, and projection boundaries remain
  **Derived** target choices, not confirmed GitHub implementation facts or
  automatic Support runtime activation.
- **Rationale:** Official sources confirm observable roles, grants, policies,
  states, and effects but do not publish GitHub's universal authorization
  algorithm or internal service topology.
- **Consequences:** This entry preserves the historical classification choice.
  The current classification and implementation handoff are owned by the
  [`github-non-code/`](github-non-code/README.md) atlas and its downstream
  architecture contracts rather than this top-level decision log.

## DOC-DEC-007: Separate evidence, design, and physical-schema authorities

- **Status:** Accepted
- **Date:** 2026-08-01
- **Decision:** Preserve [`github-non-code/`](github-non-code/README.md) as the
  canonical product-semantics atlas. The top-level governance documents index
  it but do not duplicate its evidence register or models. Database decisions
  are handed off through
  [`architecture/data-model/`](architecture/data-model/README.md), while
  [`../supabase/schemas/`](../supabase/schemas/) owns the desired physical SQL
  state.
- **Rationale:** Product evidence, implementable database design, and deployed
  SQL have different owners and verification lifecycles. Combining them made
  the same model appear authoritative in multiple places.
- **Consequences:** DOC-DEC-005 and DOC-DEC-006 are superseded as top-level
  product-semantic authorities. Existing embedded semantic views in the
  top-level documents were removed in the focused governance cleanup; new
  semantic changes occur only in the atlas and are linked from the governance
  layer.
