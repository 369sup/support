# ESLint Configuration Workflow

This file governs `packages/eslint-config/**` and adds rules for the repository's
mechanical lint policy.

## Ownership

- Export reusable flat-config presets from the package root.
- Keep custom rules under `rules/`; policy explanations remain in
  `docs/architecture`, not rule source or consumer configs.
- Consumer ESLint files select a preset and supply only a narrow,
  package-specific exception. They must not copy or silently weaken the shared
  configuration.
- A repository convention that cannot be checked reliably does not belong in
  a heuristic lint rule. Document it and add mechanical enforcement only when
  false-positive behavior is understood.

## Rule changes

- Give every diagnostic an actionable message and a stable rule name.
- Add both valid and invalid `RuleTester` cases, including the boundary case
  that motivated the rule.
- Do not add an autofix unless the transformation is semantics-preserving.
- Keep allowed aliases and framework exceptions centralized and as narrow as
  the external constraint requires.
- A rule that implements an architecture invariant must stay aligned with its
  stable `ARCH-*` rule and the architecture checker.

## Validation

Run:

```text
pnpm --filter @support/eslint-config test
pnpm lint
pnpm architecture
```

Use fixture code in tests; do not weaken a rule merely to make an existing
violation pass.
