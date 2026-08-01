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

## External identifiers

Product evidence and requirement IDs are owned by
[`github-non-code/source-register.md`](github-non-code/source-register.md) and
[`github-non-code/01-requirements-traceability.md`](github-non-code/01-requirements-traceability.md).
Follow the atlas workflow for renames and casing; do not register those IDs in
the top-level governance map.
