# Account registration

## Purpose

Coordinate personal account registration and username changes so account
identity and its password credential are prepared, committed, compensated, and
finalized as one visible outcome.

## Context content tree

- Account and credential consistency [active]
  - Use case: `register-personal-account`
  - Use case: `change-personal-account-username`
  - Owned concepts: `AccountCredentialTransaction`, `UsernameChangeTransaction`
  - Rules and invariants:
    - A reserved account is not publicly discoverable.
    - A prepared credential cannot authenticate.
    - Each participant commit remains reversible until both commits succeed.
    - Any prepare or commit failure rolls both participants back.
    - Managed users are provisioned by the enterprise and cannot use this flow.
  - Published events: none; the coordinator changes no owned product fact and
    participant event publication remains deferred.
- Email verification and account recovery [planned]
- External relationships
  - `identity/accounts::AccountIdentityTransaction`
  - `identity/authentication::PasswordCredentialTransaction`
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
- **Expected rejections:** `account-not-found`, `credential-unavailable`, `invalid-username`, `permission-denied`, `transaction-failed`, `unsupported-account-type`, `username-conflict`
- **Authorization:** A personal human account may change only its own username.
- **Transaction:** Reserve the account namespace, lock password authentication, commit both participants reversibly, compensate on failure, and finalize after both commits.
- **Idempotency:** Repeating the current case-insensitive username is safe; a conflicting account is rejected.
- **Dependencies:** `identity/accounts::AccountIdentityTransaction`, `identity/authentication::PasswordCredentialTransaction`
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
and username; Authentication owns password credentials. No participant is
considered complete until both commits succeed.

## Public capabilities

`server-api.ts` exposes personal registration and owner-authorized username
change.

## Dependencies and consistency

The coordinator synchronously calls public transaction protocols from Accounts
and Authentication. In-memory commit records remain reversible until the
coordinator finalizes both.

## Authorization

Registration is public and creates only personal human accounts. Username
change requires matching authenticated actor and target stable account IDs;
the Accounts participant rechecks this rule.

## Persistence and transactions

All participants use versioned process-local Maps. Compensation prevents
half-visible state during expected failure; process restart discards the
entire development dataset.

## Data classification

Username and stable account ID are public. Passwords are secret and pass only
to Authentication, which stores new registrations as salted scrypt verifiers.

## Retention and erasure

Finalization removes compensation metadata. Durable recovery logs and abandoned
reservation cleanup are required before a production persistence adapter.

## Events and failure behavior

No events are emitted. Expected validation, authorization, conflicts, and
participant absence return named results. Unexpected failures trigger best
effort rollback and return `registration-failed` or `transaction-failed`.

## Official sources

- <https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github>
- <https://docs.github.com/en/account-and-profile/concepts/username-changes>
- <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-strong-password>

## Exceptions

Email ownership verification is not simulated, and username redirect effects
remain deferred. This transaction runtime is process-local and not
horizontally consistent.
