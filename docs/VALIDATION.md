# Documentation Validation

Validation demonstrates that the documentation governance set is structurally
coherent and does not conflict with existing repository authorities. Version 1
uses existing repository checks plus explicit review; it does not provide a
general Markdown CI gate.

## Scope check

Before validation, inspect the repository root, branch, staged, unstaged, and
untracked changes. Confirm that the diff contains only intended files and that
unrelated user work was preserved.

## Structural checks

For the 21 top-level governance files, confirm:

- every file is non-empty UTF-8 text with a final newline;
- every file contains exactly one H1;
- the registered title matches the H1;
- `INDEX.md` and `DOCUMENT-MAP.md` contain the complete 21-file set;
- every document-map row uses valid class, authority, and lifecycle values; and
- decision IDs and ISO dates follow [`NAMING.md`](NAMING.md).

## Link and authority checks

- Resolve every local Markdown path relative to its source document.
- Verify commands, package names, and referenced repository paths.
- Confirm navigation and reference documents do not redefine canonical rules.
- Confirm generated projections identify their inputs and were not hand-edited.
- Confirm examples are labeled non-normative and future work is not reported as
  implemented.
- Check that documents contain no secrets, customer data, personal paths, or
  screenshots with personal information.

## Repository checks

Run the following from the repository root:

```text
pnpm.cmd architecture
pnpm.cmd test:architecture
pnpm.cmd governance:knowledge
git diff --check
```

`architecture` verifies required architecture and guidance constraints.
`test:architecture` exercises their positive and negative fixtures.
`governance:knowledge` reports knowledge-governance issues such as inherited
guidance duplication. `git diff --check` detects whitespace errors.

Do not run `pnpm.cmd architecture:docs` for documentation-governance-only
changes. That command is required only when its module-map or route-catalog
inputs change, and it writes generated projections.

## Result reporting

Report each command actually run and its observed result. Separately list manual
checks, unexecuted checks, unresolved links, remaining assumptions, and risks.
A timed-out, unavailable, skipped, or baseline-only check is not a pass.

## Current limitation

The repository has no general automated gate for all Markdown titles, document
map parity, or local links. Until such a gate is accepted and implemented,
maintainers perform these structural checks explicitly. The candidate work is
tracked in [`ROADMAP.md`](ROADMAP.md).

## Product-semantic checks

For a change to the integrated GitHub non-code model:

- verify every `GH-*` reference exists in the official source register and every
  registered source uses HTTPS under `docs.github.com`;
- preserve all six requirement IDs and map new requirements to evidence, model
  owners, and future acceptance focus;
- preserve the meanings of **Confirmed**, **Derived**, and **Unresolved**;
- check diagram-to-prose consistency and render every changed Mermaid block;
- ensure product models do not assert physical schemas, endpoints, literal
  routes, GitHub internals, or implementation status without an owning contract;
- check actors, ownership, independent states, authorization inputs, denial
  cases, success/failure paths, side effects, and unresolved variants; and
- verify the Git/code-development exclusions remain absent from routes,
  commands, storage, and active navigation.

When content is relocated, compare source-ID, requirement-ID, Mermaid-block,
table, invariant, and unresolved-item counts before deleting the old path.
