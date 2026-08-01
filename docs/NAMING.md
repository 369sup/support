# Documentation Naming

Names make document identity and ownership traceable. These rules apply to the
top-level documentation governance set and do not rename existing subtrees.

## Files and titles

- Top-level governance files use descriptive `UPPER-KEBAB-CASE.md` names.
- `README.md` and `AGENTS.md` retain their conventional names.
- Existing architecture, product-semantics, route, and module documents retain
  the naming rules of their own authorities.
- Every Markdown file has exactly one descriptive H1. The registered title in
  [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) matches it exactly.
- Avoid generic numbered copies such as `NEW-README.md`, `FINAL-2.md`, or
  `ARCHITECTURE-LATEST.md`. Lifecycle and history belong in governance records.

## Identifiers

Documentation decisions use `DOC-DEC-NNN`, beginning with `DOC-DEC-001` and
never reusing an identifier. Dates use ISO `YYYY-MM-DD`. Other records do not
receive identifiers until a stable cross-document reference requires one.

## Links

- Use descriptive Markdown link text and repository-relative paths.
- Link to the canonical owner instead of copying its rules.
- Do not use personal filesystem paths, editor-specific URLs, or environment
  assumptions.
- Prefer path-only links in the governance baseline. Use a heading fragment
  only when the target section is stable and validation checks it.
- Update all registered links and navigation entries when a document moves or
  changes title.

## Terms

Use the full business or governance concept. Introduce an abbreviation only
when it is established by the owning authority or defined in
[`GLOSSARY.md`](GLOSSARY.md). Do not use the same name for different concerns,
or different names for the same registered concern.

## Product-semantic identifiers

- Official evidence IDs use the stable `GH-<AREA>-NNN` form registered in
  [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md), for example `GH-REPO-005`.
- Product requirement IDs remain `SCOPE-001`, `ACT-001`, `GOV-001`, `COL-001`,
  `ENG-001`, and `SAFE-001` unless a new requirement is deliberately added to
  [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md).
- Never reuse or silently rename a source or requirement ID. Update all prose,
  diagrams, tables, acceptance references, and records when an identity changes.
- Use product names such as Issues, Discussions, Projects, and Actions with the
  casing of their owning sources. Keep logical destination labels distinct from
  literal route paths.
