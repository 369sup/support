# Documentation Governance Changelog

This changelog records changes to the documentation governance system. It does
not record product releases, application behavior, package versions, or
technical architecture history.

## 2026-08-01

### Added

- Established the 21-document governance baseline for authority, discovery,
  classification, lifecycle, maintenance, and validation.
- Added a top-level document map, source-of-truth matrix, logical metadata
  schema, relationship vocabulary, workflow, examples, and reference material.
- Recorded the initial accepted documentation-governance decisions.
- Integrated the complete GitHub non-code requirement, evidence, domain,
  lifecycle, authorization, interaction, reconstruction, and navigation model
  into the top-level documentation set.

### Changed

- Restored `docs/AGENTS.md` as concise path-local guidance and connected it to
  the documentation governance contracts.
- Moved product-evidence authority to `SOURCE-OF-TRUTH.md` and product-model
  routing to `README.md`, removing the former nested model as a competing
  navigation and maintenance path.
- Superseded that integration decision: `docs/github-non-code` now remains the
  product-semantics authority, `docs/architecture/data-model` owns database
  design handoff, and `supabase/schemas` owns desired physical SQL.

Future entries use only the applicable `Added`, `Changed`, `Deprecated`, or
`Removed` groups defined by [`SCHEMA.md`](SCHEMA.md). Do not backfill events that
cannot be verified from repository history.
