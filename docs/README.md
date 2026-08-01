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
canonical owner, affected relationships, decision log when required,
navigation, changelog, and validation evidence in the same scoped change.

Agents working in this directory also follow [`AGENTS.md`](AGENTS.md) and the
nearest nested guidance on the target path.
