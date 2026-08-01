# Documentation Dependencies

This document defines relationships among documentation artifacts. It does not
inventory runtime libraries, workspace packages, service providers, or source
imports; those remain with manifests and the technical architecture.

## Relationship types

| Relationship | Meaning | Change impact |
| --- | --- | --- |
| `governed-by` | The target owns a normative rule applied by the source. | Review the source whenever the target rule changes. |
| `depends-on` | The target provides required input needed to interpret or execute the source. | Revalidate the source when the target contract changes. |
| `references` | The target supplies optional explanation, evidence, or navigation. | Update only when the reference becomes inaccurate or broken. |
| `generated-from` | The source is a mechanical projection of the target. | Change the target and regenerate the source; never hand-edit it. |

Relationships are directional and recorded from the source document to its
target. A Markdown backlink does not automatically create a dependency.

## Allowed direction

- Entry documents route to the document map and canonical authorities.
- Governance documents may depend on narrower governance contracts, but two
  documents must not canonically own the same concern.
- Workflow documents are governed by authority, classification, schema, naming,
  dependency, and validation contracts as relevant.
- Reference documents depend on the contracts they explain and remain
  non-normative.
- Record documents preserve decisions, changes, or intent and must not override
  the active contract they describe.
- Generated documents point to exactly one declared generation input or input
  set.

Normative `governed-by` and required `depends-on` relationships must remain
acyclic. Informational navigation may link back to an entrypoint without
creating a normative cycle.

## Change analysis

Before changing a canonical document:

1. Find its incoming `governed-by` and `depends-on` relationships in
   [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md).
2. Review only the directly affected documents and their registered validation.
3. Update navigation or examples when their statements or links would become
   inaccurate.
4. Record an accepted governance change in [`DECISIONS.md`](DECISIONS.md) when
   authority, schema, vocabulary, or lifecycle policy changes.
5. Record the delivered change in [`CHANGELOG.md`](CHANGELOG.md).

## Product-semantic dependency chain

The integrated GitHub non-code model has a required reasoning order:

1. [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) owns official evidence IDs.
2. [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) maps requirements to evidence and
   acceptance focus.
3. [`SCHEMA.md`](SCHEMA.md) derives concepts, ownership, and relationships.
4. [`WORKFLOWS.md`](WORKFLOWS.md) derives independent states, transitions,
   interactions, and failure paths.
5. [`ARCHITECTURE.md`](ARCHITECTURE.md) applies visibility, authorization,
   reconstruction, and logical navigation after the behavior is understood.

Later views must not silently broaden an earlier requirement or replace its
evidence. Architecture and navigation constrain placement and presentation;
they do not create product semantics.

## Product relationship invariants

- Personal accounts remain distinct from enterprise, organization, team,
  repository, and project roles.
- Scoped memberships, assignments, team inheritance, direct grants, repository
  roles, policies, object rules, and state guards remain separate authorization
  inputs.
- Search, navigation, and notification deep links re-evaluate the same current
  visibility used by direct access.
- Commands own semantic outcomes; notification, search, and external audit
  projections consume committed events without becoming domain authorities.
- Independent state dimensions, including issue/lock and notification
  read/triage state, must not be collapsed into one dependency.
- External identity, email, search indexing, and audit export remain ports or
  projections unless a registered product source requires domain behavior.
