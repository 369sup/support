# Documentation FAQ

## Where should I start?

Use [`README.md`](README.md) for task-based routing or
[`INDEX.md`](INDEX.md) to browse. Use [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) when
you need registered ownership, classification, lifecycle, or relationships.

## Which document wins when two pages disagree?

First identify the concern, then use the authority matrix in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md). Detail, recency, or filename alone
does not decide authority.

## Does `ARCHITECTURE.md` replace the technical architecture contract?

No. It describes documentation architecture only. Technical architecture is
owned by [`architecture/architecture.md`](architecture/architecture.md).

## Does `SCHEMA.md` define application or database fields?

No. It defines logical metadata for documentation records. Runtime, API, event,
and persistence schemas remain with their existing owners.

## Does `DEPENDENCIES.md` inventory software dependencies?

No. It defines relationships among documents. Package manifests and the
technical architecture own software dependency policy.

## Is YAML front matter required?

No. Version 1 stores governance metadata in `DOCUMENT-MAP.md`. Requiring front
matter would need a separate accepted decision and migration.

## Must every document in the repository appear in the document map?

No. The map registers the 21 top-level governance documents and the authority
endpoints they depend on. Route and bounded-context inventories remain with
their existing catalogs.

## When must a decision record be added?

Add one when authority, classification, schema, naming, relationship, lifecycle,
or validation policy changes materially. Routine wording corrections do not
need a new decision.

## How do I change a generated document?

Change its declared input and use the owner generator. Never hand-edit a
projection. See [`WORKFLOWS.md`](WORKFLOWS.md).

## Is the roadmap a commitment?

No. It records candidates and prerequisites. Accepted choices go to
[`DECISIONS.md`](DECISIONS.md); delivered changes go to
[`CHANGELOG.md`](CHANGELOG.md).

## Is documentation validation fully automated?

No. Existing repository checks cover part of the contract, while title,
inventory, and general local-link checks remain explicit manual verification.
See [`VALIDATION.md`](VALIDATION.md).

## Where is the GitHub non-code semantic model now?

It is integrated into the top-level documentation set. Use
[`README.md`](README.md) for routing, [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) for
requirements, [`ARCHITECTURE.md`](ARCHITECTURE.md) for boundary and decision
views, [`SCHEMA.md`](SCHEMA.md) for concepts, [`WORKFLOWS.md`](WORKFLOWS.md) for
states and sequences, and [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) for evidence.

## Was the external GitHub evidence reverified during consolidation?

No. The recorded 2026-07-29 and 2026-07-30 verification dates were preserved.
Moving content does not create new verification evidence.

## Do the product diagrams describe GitHub internals?

No. Confirmed statements describe documented observable semantics. The
authorization order, modular-monolith topology, outbox, and projections are
derived Support reconstruction choices.

## Can a model activate a planned context or route?

No. Implementation still requires current official evidence, an active catalog
context and use case, explicit contracts, and acceptance tests under the
canonical architecture.
