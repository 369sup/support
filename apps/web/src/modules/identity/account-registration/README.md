# Account registration

## Purpose

Coordinate personal-account identity changes that span owned contexts. The
active slice changes a username through the Accounts transaction protocol;
registration and credential coordination remain planned because Supabase Auth
owns sign-up credentials and session issuance.

## Context content tree

- Account identity consistency
  - Username change [active]
    - Use case: `change-personal-account-username`
    - Owned concept: `UsernameChangeTransaction`
  - Account and credential registration [planned]
    - Use case: `register-personal-account`
    - Owned concept: `AccountCredentialTransaction`
  - Rules and invariants:
    - A reserved account is not publicly discoverable.
    - A prepared username reservation is not publicly visible.
    - The Accounts commit remains reversible until the coordinator finalizes.
    - A failed active username change compensates the Accounts participant.
    - Planned registration must coordinate any credential participant without
      taking ownership of credentials or sessions.
    - Managed users are provisioned by the enterprise and cannot use this flow.
  - Published events: none; the coordinator changes no owned product fact and
    participant event publication remains deferred.
- Email verification and account recovery [planned]
- External relationships
  - Active: `identity/accounts::AccountIdentityTransaction`
  - Planned: `identity/authentication::PasswordCredentialTransaction`
- Explicit exclusions
  - `Account`
  - `Credential`
  - `Session`
  - `EmailVerification`
  - `ScimProvisioning`

## Designed use cases

### `register-personal-account` [planned]

- **Type:** `command`
- **Application boundary:** `RegisterPersonalAccountUseCase.registerPersonalAccount()`
- **Public entrypoint:** `server-api.ts#registerPersonalAccount`
- **Input:** Requested personal username and password.
- **Success result:** `created` with stable account ID and canonical username.
- **Expected rejections:** `invalid-username`, `weak-password`, `username-conflict`, `registration-failed`
- **Authorization:** Public registration; managed users have no entry through this use case.
- **Transaction:** Account and credential reservations use reversible commits, rollback compensation, then finalization.
- **Idempotency:** Not idempotent; the case-insensitive username reservation rejects duplicates.
- **Dependencies:** `identity/accounts::AccountIdentityTransaction`, `identity/authentication::PasswordCredentialTransaction`
- **Published events:** `none`
- **Official evidence:** `identity-account-registration-source-01`, `identity-account-registration-source-03`
- **Local policy:** Personal human accounts only; email verification, social login, passkeys, and 2FA remain separate. Passwords are limited to 128 characters and the credential participant stores new passwords only as scrypt verifiers.

### `change-personal-account-username` [active]

- **Type:** `command`
- **Application boundary:** `ChangePersonalAccountUsernameUseCase.changePersonalAccountUsername()`
- **Public entrypoint:** `server-api.ts#changePersonalAccountUsername`
- **Input:** Authenticated actor account ID, target account ID, and requested username.
- **Success result:** `changed` with stable account ID and new username.
- **Expected rejections:** `account-not-found`, `invalid-username`, `permission-denied`, `transaction-failed`, `unsupported-account-type`, `username-conflict`
- **Authorization:** A personal human account may change only its own username.
- **Transaction:** Reserve the account namespace, commit the Accounts participant reversibly, compensate on failure, and finalize after the commit.
- **Idempotency:** Repeating the current case-insensitive username is safe; a conflicting account is rejected.
- **Dependencies:** `identity/accounts::AccountIdentityTransaction`
- **Published events:** `none`
- **Official evidence:** `identity-account-registration-source-02`
- **Local policy:** Old-profile redirects and repository namespace redirects remain deferred; existing sessions continue through stable account ID.

## Ubiquitous language

- **Reservation**: a namespace or credential claim invisible to normal queries.
- **Reversible commit**: participant state is visible but still retains enough
  transaction data for compensation.
- **Finalization**: removal of compensation state after every participant
  committed.

## Ownership and invariants

This context owns only the consistency workflow. Accounts owns account identity
and username; Authentication owns credentials and sessions. The active
username change completes only after the Accounts participant commits and is
finalized.

## Public capabilities

`server-api.ts` exposes the owner-authorized username change. Personal
registration remains a planned boundary and is not exported.

## Dependencies and consistency

The active coordinator synchronously calls the public Accounts transaction
protocol. Planned registration may add the Authentication credential protocol
without changing ownership. Account transaction records remain reversible
until the coordinator finalizes them.

## Authorization

Planned registration is public and would create only personal human accounts.
The active username change requires matching authenticated actor and target
stable account IDs; the Accounts participant rechecks this rule.

## Persistence and transactions

Production composition uses the durable PostgreSQL Accounts transaction
protocol. Compensation restores the prior username during expected failure;
the in-memory participant remains an isolated development and test
alternative.

## Data classification

Username and stable account ID are public. The active flow never receives a
password or credential. Any planned registration credential must pass only to
Authentication.

## Retention and erasure

Finalization removes compensation metadata. Recovery of interrupted
coordinator work and abandoned-reservation cleanup remain required operational
work.

## Events and failure behavior

No events are emitted. Expected validation, authorization, conflicts, and
participant absence return named results. Unexpected failures trigger best
effort rollback and return `registration-failed` or `transaction-failed`.

## Official sources

- <https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github>
- <https://docs.github.com/en/account-and-profile/concepts/username-changes>
- <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-strong-password>

## Exceptions

Email ownership verification and registration remain planned, and username
redirect effects remain deferred. The active coordinator is compensating, not
a cross-context distributed transaction.
