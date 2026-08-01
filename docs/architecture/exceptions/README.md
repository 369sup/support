# Architecture Exceptions

`registry.json` is the only authoritative exception registry. Do not create an
exception merely because a check fails; correct the architecture when the
standard form is possible.

Every entry must contain:

- `id`: unique `ARCH-EX-###` identifier.
- `rule`: stable architecture rule ID being waived.
- `scope`: exact repository-relative file or directory.
- `owner`: team or person responsible for review and removal.
- `reason`: external constraint that makes the standard form impossible.
- `alternatives`: alternatives considered and why they were rejected.
- `risk`: concrete cost introduced by the exception.
- `spreadPrevention`: how copying the exception is prevented.
- `reviewAfter`: future ISO date in `YYYY-MM-DD` form.
- `removalCondition`: observable condition that ends the exception.

The affected source must reference the ID in the narrowest ESLint disable or
`@architecture-exception` comment. Missing, unused, expired, or out-of-scope
entries fail `pnpm architecture`.
