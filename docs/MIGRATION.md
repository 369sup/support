# Documentation Governance Migration

This document describes adoption of the documentation governance model. It is
not a database, API, event, runtime, deployment, or content-format migration.

## Initial baseline

The initial baseline adds the 21 top-level governance documents and leaves the
existing documentation tree in place. Existing architecture contracts,
decision records, product-semantics research, generated projections, route
READMEs, and bounded-context READMEs keep their current owners and filenames.

No YAML front matter is required, and documents outside the top-level governance
set do not need individual records in [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md).
The map registers their authoritative entrypoints when they are dependencies of
the governance layer.

## Adopt an existing document

1. Identify its present responsibility, audience, owner, and evidence source.
2. Check [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) for an existing canonical
   owner. Resolve overlaps before changing navigation.
3. Classify the document using [`CLASSIFICATION.md`](CLASSIFICATION.md) without
   confusing document lifecycle with product or module status.
4. Preserve its path unless a move has a concrete discovery or ownership
   benefit.
5. Add or update only the required map, index, and dependency entries.
6. Validate links, generated boundaries, claims, and the actual diff.

## Introduce a new governance requirement

Change the canonical contract for that concern, record an accepted decision,
and update affected records in the same change. Do not introduce a compatibility
layer, duplicate policy page, or mass front-matter rewrite solely to resemble
the new structure.

## Deprecate an old convention

State the replacement, transition condition, and affected paths. Keep both
conventions only for the shortest necessary transition, and do not label the
old convention archived while active links or instructions still require it.
Follow [`WORKFLOWS.md`](WORKFLOWS.md) for lifecycle changes.

## Rollback

Documentation-governance changes are rolled back by reverting the focused
documentation change and restoring the prior map, navigation, decision, and
changelog state together. A documentation rollback must not alter generated
artifacts or implementation contracts that were outside its original scope.

## GitHub non-code authority separation

DOC-DEC-007 supersedes the earlier consolidation workflow. Preserve
[`github-non-code/`](github-non-code/README.md) as the product-evidence and
logical-semantics authority. Top-level embedded copies are compatibility
projections and receive no new semantic changes.

Database work maps the atlas into
[`architecture/data-model/`](architecture/data-model/README.md), resolves
physical decisions there, and only then changes declarative SQL. Removal of an
embedded compatibility projection is a focused governance change: update its
navigation, decision, changelog, and link dependencies together, while leaving
the canonical atlas intact.
