# Technical Contracts Workflow

This file governs `packages/contracts/**` and owns framework-neutral technical
wire schemas shared across process or module boundaries.

## Contract boundary

- Define each runtime schema once with Zod and infer its TypeScript type from
  that schema.
- Export only explicit package subpaths. Do not add a root barrel.
- Keep Next.js, React, ORM records, provider SDK types, domain objects, handlers,
  authorization policy, tenant rules, and product DTOs out of this package.
- Product contracts remain owned by their bounded context. This package may
  provide only transport-level building blocks used by those contracts.
- Evolve a published wire shape deliberately and test both valid and rejected
  payloads.

## Validation

Run:

```text
pnpm --filter @support/contracts lint
pnpm --filter @support/contracts typecheck
pnpm --filter @support/contracts test
```
