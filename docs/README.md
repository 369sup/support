# Documentation Governance

This directory contains the Support repository's technical architecture,
product-semantics research, generated projections, and the top-level controls
that make those documents discoverable and maintainable.

The governance layer does not replace the authorities it indexes. Start with
the task below, then read only the smallest relevant document set.

## Start by task

| Task | Start here | Then use |
| --- | --- | --- |
| Find the authoritative rule for a concern | [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) | The named repository authority |
| Browse available documentation | [`INDEX.md`](INDEX.md) | [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) for registered metadata |
| Create or change documentation | [`WORKFLOWS.md`](WORKFLOWS.md) | [`CLASSIFICATION.md`](CLASSIFICATION.md), [`SCHEMA.md`](SCHEMA.md), and [`NAMING.md`](NAMING.md) |
| Review maintenance impact | [`DEPENDENCIES.md`](DEPENDENCIES.md) | [`MAINTENANCE.md`](MAINTENANCE.md) |
| Validate a documentation change | [`VALIDATION.md`](VALIDATION.md) | [`ANTI-PATTERNS.md`](ANTI-PATTERNS.md) for common failures |
| Adopt an existing document | [`MIGRATION.md`](MIGRATION.md) | [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) |
| Understand an accepted governance choice | [`DECISIONS.md`](DECISIONS.md) | [`CHANGELOG.md`](CHANGELOG.md) for delivered changes |
| Understand terminology or see an illustration | [`GLOSSARY.md`](GLOSSARY.md) | [`EXAMPLES.md`](EXAMPLES.md) and [`FAQ.md`](FAQ.md) |
| Research GitHub non-code behavior | [`github-non-code/README.md`](github-non-code/README.md) | Its requirement, source, lifecycle, authorization, and sequence views |
| Design or change the database | [`architecture/data-model/README.md`](architecture/data-model/README.md) | Ordered declarative SQL under [`../supabase/schemas/`](../supabase/schemas/) |

## Existing documentation authorities

- [`architecture/architecture.md`](architecture/architecture.md) is the
  canonical human-readable technical architecture contract.
- [`architecture/module-map.json`](architecture/module-map.json) is the
  machine-readable bounded-context catalog; its Markdown projection is
  generated.
- [`../apps/web/route-map.json`](../apps/web/route-map.json) owns application
  route metadata and generated route documentation.
- [`github-non-code/README.md`](github-non-code/README.md) and
  [`github-non-code/source-register.md`](github-non-code/source-register.md)
  own GitHub non-code semantics and evidence.
- [`architecture/data-model/README.md`](architecture/data-model/README.md) owns
  the database-design handoff; [`../supabase/schemas/`](../supabase/schemas/)
  owns desired physical SQL.
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) owns change, review, commit, and
  merge workflow.

Use [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) when concerns appear to overlap.
Do not infer implementation status from a document, directory, example, dated
record, or roadmap item.

## Governance baseline

The 21 active top-level files are registered in
[`DOCUMENT-MAP.md`](DOCUMENT-MAP.md). Their logical metadata is maintained in
that map rather than YAML front matter. Material governance changes update the
canonical owner, affected relationships, decision log when required, navigation,
changelog, and validation evidence in the same scoped change.

Agents working in this directory also follow [`AGENTS.md`](AGENTS.md) and the
nearest nested guidance on the target path.

## Legacy embedded product-semantic projection

The material below predates DOC-DEC-007 and remains temporarily for link
compatibility. New semantic changes belong only in
[`github-non-code/`](github-non-code/README.md).

Audience: product architects, domain modelers, and agents preparing a
GitHub-like collaboration platform without Git or code-development workflows.

The integrated model derives reconstruction guidance from registered GitHub
documentation. It does not claim to describe GitHub's private implementation,
change Support's canonical architecture, activate a runtime module, or assign
literal routes.

### Scope boundary

The model includes:

- personal accounts, authentication boundaries, profiles, and dashboards;
- enterprises, organizations, memberships, invitations, roles, and teams;
- repository ownership, metadata, visibility, access, policy, and lifecycle;
- Issues, Discussions, Projects, notifications, subscriptions, stars, follows,
  activity, non-code search, moderation, and audit; and
- interactions among those capabilities.

It excludes Git objects, repository file contents, commits, branches, tags,
diffs, pull requests, review and merge workflows, Actions, packages,
Codespaces, Pages, and releases. When an excluded capability affects retained
metadata, only the observable non-code effect is modeled.

Authentication providers, email delivery, search indexing, and audit export
are system boundaries. Detailed billing, application integration,
sponsorship, security-product, and Wiki behavior remains outside the model.

### First-principles method

1. Record an observable statement from an ID in
   [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md).
2. Separate stable invariants from plan-specific or preview behavior.
3. Derive actors, resources, relationships, states, permissions, and events.
4. Preserve each derivation in the smallest suitable model.
5. Mark target-architecture choices as inference rather than GitHub fact.
6. Trace implementation work through [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) to a
   requirement and official source ID.

Use **Confirmed**, **Derived**, and **Unresolved** only as defined by
[`CLASSIFICATION.md`](CLASSIFICATION.md). Existing Support source,
architecture documents, and memory are placement or implementation evidence,
not substitutes for GitHub product evidence.

### Model route

| Question | Owning document |
| --- | --- |
| Requirements, evidence IDs, acceptance focus, or capability status | [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) |
| Actors, system boundary, authorization, reconstruction, or logical navigation | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Concepts, relationship ownership, or cardinality | [`SCHEMA.md`](SCHEMA.md) |
| States, transitions, interaction sequences, or failure coverage | [`WORKFLOWS.md`](WORKFLOWS.md) |
| Official GitHub sources and verification state | [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) |

Before implementation, a feature slice still needs field validation,
command/query and error contracts, permitted and forbidden acceptance cases,
deployment assumptions, and explicit decisions for every unresolved variant.
