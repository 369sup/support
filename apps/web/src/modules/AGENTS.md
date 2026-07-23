# Bounded-Context Development Workflow

This file governs `apps/web/src/modules/**`. Architecture structure and
dependency rules are not defined here.

## Required authorities

Use these canonical sources before adding or moving module code:

- [`docs/architecture/architecture.md`](../../../../docs/architecture/architecture.md)
  for dependency direction, runtime boundaries, roles, filenames, imports,
  public entrypoints, and test invariants;
- [`docs/architecture/module-template.md`](../../../../docs/architecture/module-template.md)
  for bounded-context shape;
- [`docs/architecture/module-map.json`](../../../../docs/architecture/module-map.json)
  for product scope, context identity, kind, ownership, dependencies,
  implementation status,
  and official sources; and
- [`docs/architecture/exceptions/registry.json`](../../../../docs/architecture/exceptions/registry.json)
  for approved exceptions.

Treat drift between canonical architecture documents, mechanical checks, and
tests as a failure. Do not silently choose one representation as authoritative;
update the canonical contract, enforcement, and fixtures together.

## Context activation workflow

Every catalog context has a README-owned design directory. A planned context
directory contains only `README.md`; it must not contain source files, layers,
entrypoints, fixtures, or local agent instructions. To activate one:

1. Review and refine its context README, then confirm the capability is not
   excluded or deferred in `module-map.json`.
2. Define its responsibility, owner, ubiquitous language, upstream and
   downstream relationships, data ownership, exclusions, and transaction
   boundary.
3. Record its tenant or resource scope, authorization-policy owner, permission
   ports, sensitive-data classification, retention and erasure behavior,
   redaction requirements, and auditable operations.
4. Define its published events, consumed event versions, consistency model,
   idempotency boundary, and failure behavior. Empty event catalogs require an
   explicit rationale.
5. Re-open every referenced official product source, update `verifiedOn`, and
   confirm the recorded semantics and preview maturity still match current
   HTTPS documentation under `docs.github.com/en/`.
6. Record every permitted cross-context dependency and required official
   source in `module-map.json`. Complete the approved use-case contract under
   `## Designed use cases`, mark it `[active]`, then change
   `implementationStatus` and `activationScope`.
7. Generate the module map and Serena shared memories, then review both diffs.
8. Create only the layers and public entrypoints required by the first real
   use case.
9. Add the context README decisions required by `module-template.md`.

Do not derive GitHub product behavior from model memory, third-party tutorials,
or similarly named source code. Do not create placeholder contexts for
excluded or deferred code-adjacent capabilities.

## Implementation workflow

Before coding, record the approved use case, aggregate or policy owner,
invariants, inputs, result, command/query classification, required ports,
official evidence, and local policy in the context README. Implement domain and
application behavior before concrete adapters, then expose only the smallest
public surface required by a real consumer. Add tests at the boundary carrying
the risk.

Add `<bounded-context>/AGENTS.md` only when an active context has durable local
terminology, workflow, validation, or an approved exception not expressible by
its README and these inherited authorities. Never copy the common layer rules
into a context file.

## Validation

Run `pnpm typecheck`, `pnpm lint`, `pnpm architecture`, relevant tests, and
`pnpm check` when practical. Inspect the diff for private deep imports,
client/server leaks, copied exceptions, and uncataloged context directories.
