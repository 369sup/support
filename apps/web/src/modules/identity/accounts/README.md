# Accounts

## Purpose

Own GitHub-like user account identity, username, account type, usage, and
lifecycle semantics. Active queries resolve public personal-owner references
and trusted user-account candidates.

## Context content tree

- Personal account identity
  - Account discovery [active]
    - Use case: `get-personal-account-by-username`
    - Use case: `get-account-candidate-by-username`
    - Use case: `get-account-reference-by-id`
    - Application boundary:
      `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()`
    - Owned concepts: `Account`, `Username`
    - Rules and invariants:
      - Public owner lookup returns only personal accounts.
      - Trusted candidate lookup may return personal or managed accounts.
      - Only active accounts are discoverable.
      - Account type is `personal` or `managed`; `machine` is usage.
      - Username input must remain non-empty after trimming.
    - Decisions:
      - Return a `UserOwnerReference` for public owner lookup.
      - Return an `AccountReference` only to a trusted server consumer that
        already owns the managed-user visibility decision.
      - Return `account-not-found` when no active personal account matches.
      - Return `invalid-username` when the input is invalid.
    - Published events: none for this query-only active slice.
  - Account identity transaction protocol [active]
    - Use case: `apply-account-identity-transaction`
    - Reserves registration and username changes invisibly.
    - Commits remain reversible until the coordinator finalizes.
    - Rollback removes a pending registration or restores the prior username.
  - Account lifecycle
    - Personal account deletion [active]
      - Use case: `delete-personal-account`
      - Only the active personal account owner can delete the account.
      - The persisted record transitions to `deleted` and is no longer
        discoverable.
      - Delivery signs out the browser session set after deletion.
      - `AccountDeleted@1` remains planned until transactional publication is
        available.
    - Remaining lifecycle [planned]
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

### `apply-account-identity-transaction` [active]

- **Type:** `command`
- **Application boundary:** `ApplyAccountIdentityTransactionUseCase.applyAccountIdentityTransaction()`
- **Public entrypoint:** `server-api.ts#applyAccountIdentityTransaction`
- **Input:** Trusted coordinator transaction ID and prepare, commit, rollback, or finalize step.
- **Success result:** `prepared`, `committed`, `rolled-back`, or `finalized` with account state.
- **Expected rejections:** `account-not-found`, `invalid-account`, `permission-denied`, `transaction-not-found`, `unsupported-account-type`, `username-conflict`
- **Authorization:** Registration creates personal humans only; username change rechecks actor equals target.
- **Transaction:** One account store plus case-insensitive username reservations and reversible commit metadata.
- **Idempotency:** Transaction IDs are single-use; missing or finalized IDs return `transaction-not-found`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-accounts-source-02`, `identity-accounts-source-03`
- **Local policy:** Trusted internal coordinator only; pending accounts are absent from all public and trusted active-account queries.

### `delete-personal-account` [active]

- **Type:** `command`
- **Application boundary:** `DeletePersonalAccountUseCase.deletePersonalAccount()`
- **Public entrypoint:** `server-api.ts#deletePersonalAccount`
- **Input:** Actor account ID and target account ID.
- **Success result:** `deleted`.
- **Expected rejections:** `account-not-found`, `forbidden`, `unsupported-account-type`
- **Authorization:** Owner-only account lifecycle policy in the application handler.
- **Transaction:** One context-owned PostgreSQL account transition to `deleted`.
- **Idempotency:** Repeating after deletion returns `account-not-found`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-accounts-source-04`
- **Local policy:** Managed accounts and machine-use personal accounts cannot use this personal deletion slice.

### `get-account-reference-by-id` [active]

- **Type:** `query`
- **Application boundary:** `GetAccountReferenceByIdUseCase.getAccountReferenceById()`
- **Public entrypoint:** `server-api.ts#getAccountReferenceById`
- **Input:** Account ID string.
- **Success result:** `found` with an active `AccountReference`.
- **Expected rejections:** `account-not-found`
- **Authorization:** None; only public account identity is returned.
- **Transaction:** Read-only context-local lookup.
- **Idempotency:** Query; repeated input has no side effect.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-accounts-source-06`
- **Local policy:** Suspended and deleted accounts are not returned.

### `get-account-candidate-by-username` [active]

- **Type:** `query`
- **Application boundary:** `GetAccountCandidateByUsernameUseCase.getAccountCandidateByUsername()`
- **Public entrypoint:** `server-api.ts#getAccountCandidateByUsername`
- **Input:** Raw username string from a trusted server consumer.
- **Success result:** `found` with an active personal or managed `AccountReference`.
- **Expected rejections:** `account-not-found`, `invalid-username`
- **Authorization:** The consuming context must authorize managed-user visibility before calling this trusted candidate query.
- **Transaction:** Read-only context-local lookup.
- **Idempotency:** Query; repeated input has no side effect.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-accounts-source-05`, `identity-accounts-source-06`
- **Local policy:** Trim before lookup; inactive accounts are indistinguishable from absent accounts.

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
- **Managed account**: a user account managed by an enterprise identity system.
- **Machine usage**: a personal account used for automation; not an account type.
- **Username**: the public account namespace.
- **User owner reference**: the stable account ID and current username used by
  another context to refer to a personal repository owner.

## Ownership and invariants

This context owns `Account`, `Username`, `AccountLifecycle`, and
`GhostAttribution`. Public owner lookup returns only active personal accounts;
the trusted candidate query can return an active managed account after the
consumer has made its own authorization decision. This context does not own
credentials, sessions, profiles, enterprise visibility, or repository
permissions.

## Public capabilities

- `getPersonalAccountByUsername(username)` through `server-api.ts`.
- `getAccountCandidateByUsername(username)` through `server-api.ts`.
- `getAccountReferenceById(accountId)` through `server-api.ts`.
- `deletePersonalAccount(command)` through `server-api.ts`.
- `AccountReference`, `ActorReference`, and `UserOwnerReference` through
  `integration-contracts.ts`.
- `GetPersonalAccountByUsernameUseCase.getPersonalAccountByUsername()` is the
  application boundary implemented by `GetPersonalAccountByUsernameHandler`.

Queries return discriminated absence or invalid-input results instead of
throwing for expected outcomes.
`server-api.ts` delegates through a process-reused facade created by the
private composition root; consumers do not configure or select its adapter.

## Dependencies and consistency

The active query has no cross-context dependency. Consumers may synchronously
use the framework-free `UserOwnerReference`; no reverse lookup or shared
database access is permitted.

## Authorization

Public personal-owner lookup exposes only public account identifiers. Trusted
candidate lookup is server-only and does not decide whether a caller may see a
managed account; the consuming context must establish that decision first.
Authentication and session validation remain excluded. A client-side mock
session boundary is not an authorization source.

## Persistence and transactions

Production composition uses a context-owned PostgreSQL adapter for account
identity, username reservations, reversible transaction metadata, and
lifecycle state. The in-memory adapter remains an isolated development and
test alternative.

## Data classification

Personal account ID and username are public product identifiers. Managed
account identity is enterprise-scoped data and is returned only to trusted
server consumers. Email addresses, credentials, tokens, and private profile
data are not stored or returned.

## Retention and erasure

Deleted records remain durable and are excluded from active lookups. Ghost
attribution, downstream erasure, and username-release timing remain planned
and must be defined before final deletion is activated.

## Events and failure behavior

Catalog events remain planned because there is no transactional event
publisher. Expected invalid input, authorization denial, unsupported account
type, and absence use named results; unexpected adapter failures propagate as
infrastructure errors.

## Official sources

- <https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github>
- <https://docs.github.com/en/account-and-profile/concepts/account-management>
- <https://docs.github.com/en/account-and-profile/reference/username-reference>
- <https://docs.github.com/en/account-and-profile/reference/personal-account-reference>
- <https://docs.github.com/en/rest/users/users#get-a-user>
- <https://docs.github.com/en/enterprise-cloud@latest/get-started/learning-about-github/types-of-github-accounts>

## Exceptions

None.
