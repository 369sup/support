# Documentation Map

This document is the authoritative inventory of the 21 top-level documentation
governance files and their relationships to existing repository authorities.
[`README.md`](README.md) and [`INDEX.md`](INDEX.md) provide navigation but do
not replace this registry.

## Governance inventory

| Path | Registered title | Class | Authority | Lifecycle | Owner |
| --- | --- | --- | --- | --- | --- |
| [`AGENTS.md`](AGENTS.md) | Documentation Workflow | `governance` | `subordinate` | `active` | Documentation maintainers |
| [`ANTI-PATTERNS.md`](ANTI-PATTERNS.md) | Documentation Anti-Patterns | `reference` | `non-normative` | `active` | Documentation maintainers |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Documentation Architecture | `governance` | `canonical` | `active` | Documentation maintainers |
| [`CHANGELOG.md`](CHANGELOG.md) | Documentation Governance Changelog | `record` | `canonical` | `active` | Documentation maintainers |
| [`CLASSIFICATION.md`](CLASSIFICATION.md) | Documentation Classification | `governance` | `canonical` | `active` | Documentation maintainers |
| [`DECISIONS.md`](DECISIONS.md) | Documentation Governance Decisions | `record` | `canonical` | `active` | Documentation maintainers |
| [`DEPENDENCIES.md`](DEPENDENCIES.md) | Documentation Dependencies | `governance` | `canonical` | `active` | Documentation maintainers |
| [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) | Documentation Map | `governance` | `canonical` | `active` | Documentation maintainers |
| [`EXAMPLES.md`](EXAMPLES.md) | Documentation Examples | `reference` | `non-normative` | `active` | Documentation maintainers |
| [`FAQ.md`](FAQ.md) | Documentation FAQ | `reference` | `non-normative` | `active` | Documentation maintainers |
| [`GLOSSARY.md`](GLOSSARY.md) | Documentation Glossary | `reference` | `non-normative` | `active` | Documentation maintainers |
| [`INDEX.md`](INDEX.md) | Documentation Index | `entry` | `navigational` | `active` | Documentation maintainers |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Documentation Maintenance | `workflow` | `canonical` | `active` | Documentation maintainers |
| [`MIGRATION.md`](MIGRATION.md) | Documentation Governance Migration | `workflow` | `canonical` | `active` | Documentation maintainers |
| [`NAMING.md`](NAMING.md) | Documentation Naming | `governance` | `canonical` | `active` | Documentation maintainers |
| [`README.md`](README.md) | Documentation Governance | `entry` | `navigational` | `active` | Documentation maintainers |
| [`ROADMAP.md`](ROADMAP.md) | Documentation Governance Roadmap | `record` | `non-normative` | `active` | Documentation maintainers |
| [`SCHEMA.md`](SCHEMA.md) | Documentation Schema | `governance` | `canonical` | `active` | Documentation maintainers |
| [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) | Documentation Sources of Truth | `governance` | `canonical` | `active` | Documentation maintainers |
| [`VALIDATION.md`](VALIDATION.md) | Documentation Validation | `workflow` | `canonical` | `active` | Documentation maintainers |
| [`WORKFLOWS.md`](WORKFLOWS.md) | Documentation Workflows | `workflow` | `canonical` | `active` | Documentation maintainers |

## Operating metadata

| Path | Audience | Update trigger | Dependencies | Smallest validation |
| --- | --- | --- | --- | --- |
| [`AGENTS.md`](AGENTS.md) | Agents and documentation reviewers | A `docs/**` instruction, authority route, or workflow changes | `governed-by`: `../AGENTS.md`; `depends-on`: `SOURCE-OF-TRUTH.md`, `DOCUMENT-MAP.md`, `VALIDATION.md` | Architecture and knowledge guidance checks |
| [`ANTI-PATTERNS.md`](ANTI-PATTERNS.md) | Contributors and reviewers | A recurring documentation failure is verified | `depends-on`: `SOURCE-OF-TRUTH.md`, `WORKFLOWS.md` | H1 and local links |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Documentation designers and maintainers | A governance layer, invariant, navigation rule, or propagation rule changes | `depends-on`: `SOURCE-OF-TRUTH.md`, `DOCUMENT-MAP.md`, `DEPENDENCIES.md` | H1, local links, and Mermaid rendering |
| [`CHANGELOG.md`](CHANGELOG.md) | Maintainers and reviewers | A governance change is delivered | `governed-by`: `SCHEMA.md`, `NAMING.md` | ISO date and valid change groups |
| [`CLASSIFICATION.md`](CLASSIFICATION.md) | Documentation authors and reviewers | A class, authority, or lifecycle value changes | `depends-on`: `SOURCE-OF-TRUTH.md` | Vocabulary parity with this map |
| [`DECISIONS.md`](DECISIONS.md) | Maintainers and reviewers | A material governance choice is accepted or superseded | `governed-by`: `SCHEMA.md`, `NAMING.md`; `depends-on`: `SOURCE-OF-TRUTH.md` | Unique IDs and complete decision fields |
| [`DEPENDENCIES.md`](DEPENDENCIES.md) | Documentation designers and maintainers | A relationship type or propagation rule changes | `depends-on`: `SOURCE-OF-TRUTH.md`, `CLASSIFICATION.md` | Relationship vocabulary and acyclic normative graph |
| [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) | Documentation users and maintainers | A registered document, authority endpoint, owner, lifecycle, or relationship changes | `governed-by`: `SCHEMA.md`, `CLASSIFICATION.md`, `DEPENDENCIES.md`; `depends-on`: `SOURCE-OF-TRUTH.md` | Exact inventory and metadata completeness |
| [`EXAMPLES.md`](EXAMPLES.md) | Documentation authors | A demonstrated contract changes | `depends-on`: `WORKFLOWS.md`, `SCHEMA.md`, `CLASSIFICATION.md` | Labels, H1, and local links |
| [`FAQ.md`](FAQ.md) | All documentation users | A common answer or authority route changes | `depends-on`: `README.md`, `SOURCE-OF-TRUTH.md` | Answers agree with canonical owners |
| [`GLOSSARY.md`](GLOSSARY.md) | All documentation users | A governance term is added or changes | `depends-on`: `CLASSIFICATION.md`, `DEPENDENCIES.md` | Terms agree with owning contracts |
| [`INDEX.md`](INDEX.md) | Readers locating documentation | A registered file or documentation area changes | `depends-on`: `DOCUMENT-MAP.md` | Exact 21-file navigation coverage |
| [`MAINTENANCE.md`](MAINTENANCE.md) | Maintainers | An owner, review trigger, or health signal changes | `depends-on`: `DOCUMENT-MAP.md`, `VALIDATION.md` | Triggers have owners and verifiable outcomes |
| [`MIGRATION.md`](MIGRATION.md) | Maintainers adopting the model | An adoption or deprecation rule changes | `depends-on`: `WORKFLOWS.md`, `DOCUMENT-MAP.md` | No runtime-migration claims and valid links |
| [`NAMING.md`](NAMING.md) | Authors and reviewers | A filename, title, identifier, or link rule changes | `depends-on`: `SOURCE-OF-TRUTH.md` | Path, title, ID, and link consistency |
| [`README.md`](README.md) | Documentation users and maintainers | A primary task route or repository authority changes | `depends-on`: `INDEX.md`, `DOCUMENT-MAP.md`, `SOURCE-OF-TRUTH.md`, `VALIDATION.md` | Entry links and task routing resolve |
| [`ROADMAP.md`](ROADMAP.md) | Maintainers planning improvements | A candidate is added, promoted, completed, or rejected | `governed-by`: `SCHEMA.md`; `references`: `DECISIONS.md`, `CHANGELOG.md` | Intent is not presented as delivery |
| [`SCHEMA.md`](SCHEMA.md) | Governance authors and tooling designers | A documentation record field or conformance rule changes | `depends-on`: `CLASSIFICATION.md`, `NAMING.md`, `SOURCE-OF-TRUTH.md`, `DOCUMENT-MAP.md` | Required fields and local links |
| [`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md) | Documentation users and reviewers | A canonical concern or repository authority endpoint changes | `references`: repository authority endpoints | Authority rows resolve, remain unique, and do not overlap |
| [`VALIDATION.md`](VALIDATION.md) | Authors and reviewers | A relevant command, integrity check, or reporting rule changes | `governed-by`: `../CONTRIBUTING.md`; `depends-on`: `DOCUMENT-MAP.md`, `SOURCE-OF-TRUTH.md` | Documented checks exist and cover structure, authority, and links |
| [`WORKFLOWS.md`](WORKFLOWS.md) | Documentation authors and maintainers | A documentation lifecycle or handoff step changes | `depends-on`: `SOURCE-OF-TRUTH.md`, `DOCUMENT-MAP.md`, `SCHEMA.md`, `CLASSIFICATION.md`, `VALIDATION.md` | Documentation lifecycle and handoff rules are covered |

## Repository authority endpoints

These existing artifacts are dependencies of this governance layer, not members
of the 21-file inventory.

| Endpoint | Registered concern | Relationship |
| --- | --- | --- |
| [`../AGENTS.md`](../AGENTS.md) | Repository-wide engineering guidance | `AGENTS.md` is `governed-by` it. |
| [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Change and review lifecycle | Documentation workflows and validation reference it. |
| [`architecture/architecture.md`](architecture/architecture.md) | Human-readable technical architecture | Governance documents reference it; they do not summarize it as a new contract. |
| [`../packages/tooling/src/architecture/policy.mjs`](../packages/tooling/src/architecture/policy.mjs) | Machine-enforced `ARCH-*` policy | Architecture documentation declares it as enforcement owner. |
| [`architecture/module-map.json`](architecture/module-map.json) | Bounded-context catalog | `module-map.md` is `generated-from` it. |
| [`../apps/web/route-map.json`](../apps/web/route-map.json) | Application route contract | Generated route documentation is projected from it. |
| [`github-non-code/README.md`](github-non-code/README.md) | GitHub non-code product evidence and logical semantics | The atlas and its source register own product semantics; top-level governance files only route to them. |
| [`architecture/data-model/README.md`](architecture/data-model/README.md) | Database-design handoff | Resolves active physical disposition before declarative SQL exists. |
| [`../supabase/schemas/`](../supabase/schemas/) | Desired physical database state | Ordered declarative SQL is the sole physical target authority. |

## Registration rules

- Keep one row per top-level governance document in both inventory tables.
- Keep titles identical to their H1 text and paths repository-relative.
- Use only vocabulary defined by [`CLASSIFICATION.md`](CLASSIFICATION.md) and
  [`DEPENDENCIES.md`](DEPENDENCIES.md).
- Update identity, ownership, lifecycle, and relationship changes atomically
  with the affected document, index, decision, and changelog entries.
- Keep product requirements, evidence IDs, models, and capability status in
  [`github-non-code/`](github-non-code/README.md), not in this map.
- Do not expand this map into a catalog of every generated route or bounded-
  context README; their existing source contracts already own those inventories.
