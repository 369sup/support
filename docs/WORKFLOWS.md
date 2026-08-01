# Documentation Workflows

These workflows apply the documentation contracts without changing the product,
technical architecture, or repository change process. Repository-wide change
and review requirements remain in [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## Create a document

1. State the audience, concrete question, owner, and expected update trigger.
2. Search [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) and the existing tree for an
   authority that already owns the concern. Extend or link to it instead of
   creating a competing document.
3. Select one class, authority value, and lifecycle from
   [`CLASSIFICATION.md`](CLASSIFICATION.md).
4. Choose a compliant path, title, and identifier using
   [`NAMING.md`](NAMING.md).
5. Write the smallest document that answers the stated question. Mark examples,
   future intent, and unverified claims explicitly.
6. Register the document and its typed relationships in
   [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) when it belongs to the top-level
   governance set. Add navigational links only where readers need them.
7. Run [`VALIDATION.md`](VALIDATION.md) and record the delivered governance
   change in [`CHANGELOG.md`](CHANGELOG.md).

## Change a document

1. Inspect the worktree and confirm the target document, its owner, and unrelated
   user changes.
2. Verify the current authority or evidence before changing a normative claim.
3. Edit the canonical owner first. Do not repair a conflict by changing only a
   generated, subordinate, or non-normative document.
4. Follow incoming `governed-by` and `depends-on` relationships from the document
   map and update only affected dependents.
5. Add a decision record when authority, classification, schema, naming,
   dependency, or lifecycle policy changes.
6. Add a changelog entry, inspect the actual diff, and run the smallest relevant
   validation.

## Replace or deprecate a document

1. Name the active replacement and explain why the old responsibility is moving.
2. Change the old document's lifecycle to `deprecated` in the document map.
3. Add a prominent replacement link without rewriting the historical meaning.
4. Move active navigation to the replacement and update required dependencies.
5. Keep the deprecated path until valid consumers have migrated or a deliberate
   removal decision is accepted.

## Archive or remove a document

Archive only when the document is no longer active but must remain as historical
evidence. Remove it from active navigation, retain its context, and register the
`archived` lifecycle. Delete only when retention is unnecessary, links and
dependencies are clear, and the change is recorded.

## Change a generated document

Identify its `generated-from` relationship, change the declared input, run the
owner generator, and inspect the generated diff. Never edit the projection
directly. The commands and ownership boundaries for architecture projections
remain in [`architecture/AGENTS.md`](architecture/AGENTS.md).

## Product-semantics handoff

Changes to GitHub non-code evidence or logical models follow
[`github-non-code/AGENTS.md`](github-non-code/AGENTS.md). Update top-level
governance records only when authority, navigation, or a registered dependency
changes; do not copy the atlas content into this workflow.

## Handoff

A documentation change is ready for review when its authority is clear, map and
navigation entries agree, local links resolve, examples are labeled, the diff is
scoped, and validation results distinguish passed, failed, and unexecuted checks.
