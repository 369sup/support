# Deployable Applications Contract

Scope: `apps/**`. This file adds deployable-runtime rules to the repository
contract.

## Delta rules

- An application owns framework composition, startup, process-local state,
  request delivery, and deployment integration.
- Keep product behavior in the application's bounded contexts and reusable
  business-free capabilities in `packages/`.
- Do not create cross-application shared source roots or make a package depend
  on an application.
- Process memory is non-durable and instance-local. Do not imply persistence,
  cross-instance coordination, or production suitability without an owned
  adapter and an explicit contract.
- Await request work. Background work must have an application-owned lifecycle,
  bounded concurrency, retry/failure policy, and shutdown behavior.
- Environment differences configure composition; they do not fork business
  rules.

## Verification delta

For runtime-composition changes, verify startup and shutdown behavior, server
boundaries, environment parsing, and the affected application build in addition
to the repository architecture checks.
