## Outcome

Describe one concrete outcome, the affected ownership boundaries, and behavior
that must remain unchanged.

## Behavior and architecture impact

Describe public behavior, architecture boundaries, generated artifacts, and
compatibility or migration effects.

## Trust and operational boundaries

Describe affected authentication, authorization, tenant, data, privacy,
security, billing, migration, and operational boundaries. Write `None` when
not applicable.

## Verification

List commands actually run and their observed results.

```text
# command
# observed result
```

List checks not run and the remaining risk.

## Dependencies and supply chain

Describe manifest, lockfile, action, external service, or client-bundle impact.
Write `None` when not applicable.

## Migration, rollback, or forward fix

For high-risk changes, describe migration and rollback or forward-fix steps.
Write `None` when not applicable.

## Review checklist

- [ ] The change has one clear and reversible purpose.
- [ ] Documentation and generated projections are updated with their source.
- [ ] Required type, lint, architecture, and behavior checks were not skipped.
- [ ] New warnings, blanket suppressions, and permanent warning baselines were not introduced.
- [ ] Unexecuted checks and remaining risks are stated above.
