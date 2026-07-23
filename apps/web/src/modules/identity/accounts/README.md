# Accounts

## Purpose

Own GitHub-like personal account identity and username semantics. The first
active slice resolves a public personal-account reference by username.

## Ubiquitous language

- **Account**: the identity used to access GitHub product resources.
- **Username**: the public account namespace.
- **User owner reference**: the stable account ID and current username used by
  another context to refer to a personal repository owner.

## Ownership and invariants

This context owns `Account`, `Username`, `AccountLifecycle`, and
`GhostAttribution`. The active query returns only active personal accounts. It
does not own credentials, sessions, profiles, or repository permissions.

## Public capabilities

- `getPersonalAccountByUsername(username)` through `server-api.ts`.
- `UserOwnerReference` through `integration-contracts.ts`.
- `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()` is the
  application boundary implemented by `GetPersonalAccountByUsernameHandler`.

The query returns a discriminated `account-not-found` or `invalid-username`
result instead of throwing for expected absence.

## Dependencies and consistency

The active query has no cross-context dependency. Consumers may synchronously
use the framework-free `UserOwnerReference`; no reverse lookup or shared
database access is permitted.

## Authorization

The active capability exposes only the public account ID and username and does
not require authorization. Authentication and session validation remain
excluded. A client-side mock session boundary is not an authorization source.

## Persistence and transactions

The first slice uses a context-local in-memory query adapter with deterministic
development fixtures. It performs no writes and owns no transaction.

## Data classification

Account ID and username are public product identifiers. Email addresses,
credentials, tokens, and private profile data are not stored or returned.

## Retention and erasure

The in-memory fixture lives for the process lifetime. Future durable adapters
must follow the account deletion and ghost-attribution rules before activation.

## Events and failure behavior

This query-only activation emits no events. All catalog events remain planned.
Expected invalid input and absence use named results; unexpected adapter
failures propagate as infrastructure errors.

## Official sources

- <https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github>
- <https://docs.github.com/en/account-and-profile/concepts/account-management>
- <https://docs.github.com/en/account-and-profile/reference/username-reference>
- <https://docs.github.com/en/account-and-profile/reference/personal-account-reference>

## Exceptions

None.
