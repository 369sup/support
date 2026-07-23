# Architecture Documentation Workflow

This file governs `docs/architecture/**` and adds change-control rules for the
repository's architecture contract.

## Authority map

- `architecture.md` owns human-readable invariants, names, runtime boundaries,
  and the ADR trigger policy.
- `@support/tooling/architecture/policy` owns the complete stable `ARCH-*`
  registry, enforcement gate, shared entrypoints, layer names, and workspace
  package matrix.
- `module-template.md` owns the bounded-context README schema and activation
  workflow.
- `decisions/README.md` owns the ADR lifecycle, index, and template.
- `module-map.json` is the machine-readable context catalog.
- `module-map.md` is generated from `module-map.json`; never edit it directly.
- `apps/web/src/modules/<subdomain>/<bounded-context>/README.md` is the
  human-maintained semantic model for each catalog context.
- `exceptions/registry.json` is the only architecture exception registry.

`AGENTS.md` files may translate these contracts into concise subtree-local
workflow and review checklists, but the contract named above resolves any
semantic conflict. A nested instruction must not create a competing
definition, weaken an invariant, or broaden an exception. ESLint and TypeScript
configuration own code-style enforcement that does not protect an architecture
boundary. Update the canonical document, the mechanical check, and its
positive and negative fixtures together when an enforceable architecture rule
changes.

## Catalog and exception changes

- Keep the product scope, excluded capabilities, deferred capabilities,
  context ownership, and permitted context dependencies in `module-map.json`.
- Do not activate a bounded context without defined ownership, exclusions,
  dependencies, and the required official GitHub documentation sources.
- Product sources must be HTTPS URLs under `docs.github.com/en/` and must state
  which product semantics they support. Give every source a stable ID and a
  truthful `verifiedOn` value; `null` means it has not yet been re-verified.
  Technical capabilities do not receive product sources merely to satisfy
  validation.
- Every context declares a complete published-event catalog or an explicit
  empty-catalog rationale. Event dependencies name exact event versions owned
  by the target context; a transport capability never becomes the semantic
  owner of a product event.
- A context whose `implementationStatus` is `planned` has a README-only design
  directory. Do not add source files, layers, or entrypoints before activation.
- Treat `## Designed use cases` in the context README as the only authority for
  approved application boundaries. An `[active]` entry must exist before its
  handler, port, public entrypoint, or `activationScope` is implemented.
- Give each exception one stable ID, the narrowest scope, a concrete reason,
  an owner, and a removal condition. An exception is not a reusable example.
- Regenerate the Markdown catalog with `pnpm architecture:docs` after changing
  `module-map.json`, then inspect the generated diff. Run
  `pnpm architecture:contexts` only to scaffold missing context READMEs; refine
  their semantic content manually.

## Validation

Run:

```text
pnpm architecture:docs
pnpm serena:memories
pnpm architecture
pnpm test:architecture
```

Finish by confirming generated documentation is current and no rule ID or
exception reference is orphaned.
