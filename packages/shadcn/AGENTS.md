# Shadcn Source Package Workflow

This file governs `packages/shadcn/**` and owns shadcn generation and local UI
maintenance workflow. UI placement, dependency direction, naming, and consumer
imports remain authoritative in
[`docs/architecture`](../../docs/architecture/AGENTS.md).

## Local source ownership

- `src/hooks` contains product-agnostic browser behavior.
- `src/lib` contains narrowly named UI implementation support, never a general
  utility layer.
- `src/styles` owns reusable design tokens and UI base styles. Application
  styles consume that source instead of redefining it.

The architecture rules own the distinction between registry source,
product-agnostic compositions, and product-aware UI; do not restate that
classification here.

## Required workflow

1. Run shadcn CLI commands from `packages/shadcn`.
2. Use `pnpm dlx shadcn@latest add <component>` for registry primitives.
3. Inspect every generated file and add its explicit package subpath export.
4. Preserve upstream component names.
5. Keep upstream-compatible changes narrow and place reusable compositions in
   the architecture-assigned custom source location.

Do not hand-create registry source when an official component exists. Existing
files may be split mechanically to satisfy repository export clarity.

## Validation

```text
pnpm --filter @support/shadcn typecheck
pnpm --filter @support/shadcn lint
pnpm --filter @support/web build
```

For visible changes, verify consuming routes at relevant desktop and mobile
sizes. For interactive primitives, verify keyboard focus, disabled state,
accessible name, and open/close behavior.
