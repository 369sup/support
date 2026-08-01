# Documentation Sources of Truth

This document defines how documentation authority is assigned and how conflicts
are resolved. It governs documentation ownership only; it does not replace any
product, architecture, route, data, or delivery contract.

## Authority matrix

| Concern | Authoritative source | Notes |
| --- | --- | --- |
| Repository-wide engineering guidance | [`../AGENTS.md`](../AGENTS.md) | Nested `AGENTS.md` files add path-local instructions only. |
| Change, review, commit, and merge workflow | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Documentation must change with the behavior or contract it describes. |
| Human-readable technical architecture | [`architecture/architecture.md`](architecture/architecture.md) | Resolves semantic architecture conflicts. |
| Machine-enforced architecture policy | [`../packages/tooling/src/architecture/policy.mjs`](../packages/tooling/src/architecture/policy.mjs) | Owns registered `ARCH-*` rules and enforcement metadata. |
| Bounded-context catalog | [`architecture/module-map.json`](architecture/module-map.json) | Owns context status, ownership, dependencies, and activation data. |
| Generated context projection | [`architecture/module-map.md`](architecture/module-map.md) | Generated from `module-map.json`; never edited directly. |
| Application route contract | [`../apps/web/route-map.json`](../apps/web/route-map.json) | Owns route identifiers, paths, and generated route documentation. |
| GitHub non-code product evidence and semantics | [`github-non-code/README.md`](github-non-code/README.md) and its [`source-register.md`](github-non-code/source-register.md) | The atlas owns registered evidence and logical semantics; it is not a physical schema. |
| Database-design handoff | [`architecture/data-model/README.md`](architecture/data-model/README.md) | Owns resolved logical-to-physical disposition for active and planned contexts. |
| Desired physical database state | [`../supabase/schemas/`](../supabase/schemas/) | Owns declarative SQL; migrations are immutable history. |
| Top-level documentation inventory | [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) | Owns the registered governance-document set and its relationships. |
| Documentation metadata fields | [`SCHEMA.md`](SCHEMA.md) | Defines the logical record shape used by the document map and logs. |
| Documentation vocabulary | [`CLASSIFICATION.md`](CLASSIFICATION.md) | Owns class, authority, and lifecycle values. |
| Documentation lifecycle | [`WORKFLOWS.md`](WORKFLOWS.md) | Owns create, change, replace, deprecate, and archive workflows. |
| Documentation validation | [`VALIDATION.md`](VALIDATION.md) | Owns the documentation-specific verification checklist. |

The three external-source registries are scoped rather than interchangeable.
The atlas source register owns evidence for the product-semantics model;
`module-map.json` records evidence supporting one bounded context's catalog
claims; and `route-map.json` records evidence supporting GitHub URL and
navigation compatibility. A URL may appear in more than one registry only when
each owner states its distinct supported claim. Source IDs and verification
dates remain local to their owning registry and must not be copied across
scopes as if they were one record.

## Conflict resolution

1. Identify the concern being decided; similar filenames do not imply shared
   authority.
2. Use the authority in the matrix for that concern.
3. Treat indexes, examples, FAQ answers, generated projections, and historical
   records as supporting material, not competing rules.
4. If two canonical sources appear to overlap, stop and clarify their
   responsibility boundaries. Do not silently choose the newer or more detailed
   text.
5. Correct the subordinate document and link to the canonical source. Change the
   canonical source only when its owned contract is intentionally changing.

An implemented file, route, or test is evidence of repository state, but its
existence does not override a declared architecture or catalog status. Likewise,
documentation does not prove that described behavior is implemented.

## Generated documents

Generated documents are projections of their declared inputs. Update the input
and run its owner generator; never repair the projection by hand. A generated
document may be authoritative for navigation or presentation only when its
source contract explicitly grants that role.

For this repository, `module-map.md` and generated route READMEs are examples of
projections. Their generation and validation rules remain owned by the existing
architecture automation.

## Evidence vocabulary

The terms **Confirmed**, **Derived**, and **Unresolved** belong to the
[`github-non-code`](github-non-code/README.md) product-semantics atlas. General
documentation uses the lifecycle and authority vocabulary from
[`CLASSIFICATION.md`](CLASSIFICATION.md) instead of borrowing those evidence
labels.
