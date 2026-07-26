# Custom UI compositions

This directory contains reusable, product-agnostic compositions built from
official primitives in `../ui` or narrow browser behavior in `../hooks`.

Current compositions:

- `development-api-gate.tsx` renders shared development API startup and failure
  states without knowing the API provider or product fixtures.
- `route-placeholder.tsx` renders the shared foundation for planned routes.

Components that understand repositories, accounts, invitations, notifications,
or other product language belong to their owning bounded context under
`apps/web/src/modules`.
