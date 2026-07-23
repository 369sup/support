# Accounts

## Purpose

Own GitHub-like personal account identity and username semantics. The first
active slice resolves a public personal-account reference by username.

## Context content tree

- Personal account identity
  - Account discovery [active]
    - Use case: `get-personal-account-by-username`
    - Application boundary:
      `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()`
    - Owned concepts: `Account`, `Username`
    - Rules and invariants:
      - Only personal accounts are returned.
      - Only active accounts are discoverable.
      - Username input must remain non-empty after trimming.
    - Decisions:
      - Return a `UserOwnerReference`.
      - Return `account-not-found` when no active personal account matches.
      - Return `invalid-username` when the input is invalid.
    - Published events: none for this query-only active slice.
  - Account lifecycle [planned]
    - Owned concepts: `AccountLifecycle`, `GhostAttribution`
    - Planned behaviors:
      - Account creation
      - Username change
      - Account deletion
      - Ghost attribution
    - Planned events: `AccountCreated@1`, `UsernameChanged@1`,
      `AccountDeleted@1`
- External relationships
  - Active runtime dependencies: none.
- Explicit exclusions
  - `Credential`
  - `Session`
  - `Profile`
  - `EnterpriseMembership`

## Designed use cases

### `get-personal-account-by-username` [active]

- **Type:** `query`
- **Application boundary:** `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()`
- **Public entrypoint:** `server-api.ts#getPersonalAccountByUsername`
- **Input:** Raw username string.
- **Success result:** `found` with an `AccountQuerySnapshot`, mapped publicly to a `UserOwnerReference`.
- **Expected rejections:** `account-not-found`, `invalid-username`
- **Authorization:** None; this slice exposes public account identifiers only.
- **Transaction:** Read-only lookup with no transaction.
- **Idempotency:** Query; repeated input has no side effect.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-accounts-source-05`
- **Local policy:** Trim before lookup, reject an empty normalized username, and return only active personal accounts.

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
`server-api.ts` delegates through a process-reused facade created by the
private composition root; consumers do not configure or select its adapter.

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
- <https://docs.github.com/en/rest/users/users#get-a-user>

## Exceptions

None.
