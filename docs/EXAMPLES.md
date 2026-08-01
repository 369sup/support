# Documentation Examples

These examples illustrate the active governance contracts. They are
non-normative: when an example and a canonical document differ, follow the
canonical document and correct the example.

## Register a new governance document

Suppose maintainers accept a new top-level document named `OPERATIONS.md`.
A conforming change would:

1. establish a responsibility not already owned in
   [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md);
2. classify it, for example as `workflow`, `canonical`, and `active`;
3. add both inventory and operating-metadata rows to
   [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md);
4. add only the navigation links needed by its audience;
5. record the authority change in [`DECISIONS.md`](DECISIONS.md) and delivery in
   [`CHANGELOG.md`](CHANGELOG.md); and
6. run [`VALIDATION.md`](VALIDATION.md).

The filename is illustrative and does not reserve or authorize that document.

## Link to an existing authority

Prefer a bounded statement:

> Technical architecture rules are owned by
> `docs/architecture/architecture.md`; this guide describes only the
> documentation workflow applied around them.

Do not copy the architecture rules into a new summary and call both documents
canonical.

## Record a relationship

A document that cannot be interpreted without the classification vocabulary
uses `depends-on: CLASSIFICATION.md`. A FAQ that merely offers readers an
optional path uses `references`. A generated projection uses `generated-from`
and identifies the generator-owned input.

## Deprecate a document

A deprecated document keeps its H1 and historical content, adds a visible link
to the active replacement, changes lifecycle in the document map, and leaves
active navigation only after consumers have migrated. It is not renamed to
`OLD-*` or silently deleted.

## Report validation

A useful handoff distinguishes evidence:

```text
Passed: pnpm.cmd architecture; git diff --check
Manual: 21-file inventory parity; local link resolution
Not run: pnpm.cmd test:architecture
Remaining risk: no general Markdown link gate exists
```

Do not report an unavailable, timed-out, skipped, or planned check as passing.

## Prepare a product-semantic slice

For a repository-archive feature, start at `COL-001` in
[`github-non-code/01-requirements-traceability.md`](github-non-code/01-requirements-traceability.md),
follow `GH-REPO-005` to
[`github-non-code/source-register.md`](github-non-code/source-register.md), and
then read only the repository relationships, lifecycle, authorization,
interaction, and navigation views that constrain the slice.

The implementation handoff should cover:

1. actors and repository ownership;
2. active versus archived state and independent conversation states;
3. effective authorization inputs and denied cases;
4. success, conflict, and forbidden mutation paths;
5. notification, projection, moderation, and audit side effects; and
6. unresolved plan, account, deployment, retention, or restoration variants.

Only after that checklist is complete should the slice be mapped to the
canonical architecture, active module catalog, public entrypoints, command/API
contracts, and tests. The diagrams do not authorize missing contracts.

## Classify a semantic statement

- "Archived repositories are read-only" is **Confirmed** by `GH-REPO-005`.
- "Use a transactional outbox" is **Derived** reconstruction guidance.
- "Return a particular HTTP status for a hidden repository" is **Unresolved**
  until an API contract is accepted.

These labels describe product-evidence confidence, not document lifecycle or
module implementation status.
