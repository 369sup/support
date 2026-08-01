# Bounded Context Workflow

Scope: `apps/web/src/modules/**`. Semantic authority is
[`../../../../docs/architecture/architecture.md`](../../../../docs/architecture/architecture.md);
README lifecycle and schema are owned by
[`../../../../docs/architecture/module-template.md`](../../../../docs/architecture/module-template.md).

## Context delta

- Context paths are `<subdomain>/<bounded-context>` in lowercase kebab-case and
  must match `module-map.json`.
- A planned context contains `README.md` only. Activate it before adding source,
  layers, fixtures, entrypoints, or local instructions.
- Create only layers used by an approved active use case. Context roots and
  public entrypoints are limited to the canonical architecture contract.
- Public consumers use `server-api.ts`, `browser-ui.ts`, `server-actions.ts`, or
  `integration-contracts.ts`; internal context imports stay relative.
- Domain and application remain framework- and provider-independent. External
  work enters through ports; adapters implement those ports; composition only
  wires them.
- Every active capability preserves the catalog-to-code chain:
  `activationScope` → designed use case → inbound port → named operation →
  handler → real public consumer.
- Authorization, tenant scope, data ownership, transactions, retention,
  redaction, event delivery, and failure policy must name an owner. Do not infer
  them from routes, adapters, provider behavior, or GitHub resemblance.
- Runtime dependencies require declared active targets and public contracts.
  Planned relationships never authorize imports or event handling.

## README loading

- Planned context: read the compact README in full.
- Handler or public API work: read `Designed use cases`.
- Policy work: also read `Authorization`.
- Store or migration work: also read `Persistence and transactions`, `Data
  classification`, and `Retention and erasure`.
- Event work: also read `Events and failure behavior`.
- Read an active README in full only for activation, architecture review, or a
  change spanning several decision areas.

## Verification delta

Before editing, identify the catalog entry, designed use case, public
entrypoint, references, and tests. After editing, inspect diagnostics and
references, then run focused tests plus architecture validation.
