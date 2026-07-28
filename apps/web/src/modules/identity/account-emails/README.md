# Account Emails Bounded Context

- **Catalog path:** `identity/account-emails`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `validated`

## Purpose

Own account email addresses, verification, primary and public selection,
managed-user ownership, reuse quarantine, and organization notification routes.

## Context content tree

- Account email lifecycle [active]
  - `add-account-email`
  - `list-account-emails`
  - `verify-account-email`
  - `update-account-email-settings`
  - Owned: `AccountEmail`, `EmailVerification`, `EmailReuseQuarantine`
- Organization notification routing [active]
  - Owned: `OrganizationNotificationRoute`
- Published events [planned]
  - `AccountEmailAdded@1`
  - `AccountEmailVerified@1`
  - `PrimaryAccountEmailChanged@1`
- External relationship
  - `platform/notification-channels::EmailVerificationDelivery`
- Excludes
  - `AccountLifecycle`, `AuthenticationFactor`, `NotificationContent`,
    `VerifiedDomainLifecycle`

## Designed use cases

### `add-account-email` [active]

- **Type:** `command`
- **Application boundary:** `AddAccountEmailUseCase.addAccountEmail()`
- **Public entrypoint:** `server-api.ts#addAccountEmail`
- **Input:** Account, normalized address, account-management type, and personal or SCIM ownership.
- **Success result:** `added`.
- **Expected rejections:** `invalid-email`, `managed-by-identity-provider`, `account-email-limit`, `email-already-owned`, `email-quarantined`
- **Authorization:** The account owner or trusted SCIM composition.
- **Transaction:** One unique address insert.
- **Idempotency:** An existing address returns `email-already-owned`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-account-emails-source-01`, `identity-account-emails-source-05`
- **Local policy:** Released addresses remain quarantined for 90 days.

### `list-account-emails` [active]

- **Type:** `query`
- **Application boundary:** `ListAccountEmailsUseCase.listAccountEmails()`
- **Public entrypoint:** `server-api.ts#listAccountEmails`
- **Input:** Account ID.
- **Success result:** `found` with owned addresses.
- **Expected rejections:** `invalid-account`
- **Authorization:** Account owner or trusted administration.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-account-emails-source-01`, `identity-account-emails-source-04`
- **Local policy:** Verification tokens are excluded.

### `verify-account-email` [active]

- **Type:** `command`
- **Application boundary:** `VerifyAccountEmailUseCase.verifyAccountEmail()`
- **Public entrypoint:** `server-api.ts#verifyAccountEmail`
- **Input:** Account/email for request or opaque token for confirmation.
- **Success result:** `verification-sent` or `verified`.
- **Expected rejections:** `email-not-found`, `delivery-failed`, `invalid-token`, `verification-expired`
- **Authorization:** Account owner for request; possession of a live token for confirmation.
- **Transaction:** Token replacement or token consumption plus email verification.
- **Idempotency:** A consumed token is invalid; delivery uses a stable idempotency key.
- **Dependencies:** `platform/notification-channels::EmailVerificationDelivery`
- **Published events:** `none`
- **Official evidence:** `identity-account-emails-source-03`
- **Local policy:** Tokens expire after one hour and are stored only as hashes.

### `update-account-email-settings` [active]

- **Type:** `command`
- **Application boundary:** `UpdateAccountEmailSettingsUseCase.updateAccountEmailSettings()`
- **Public entrypoint:** `server-api.ts#updateAccountEmailSettings`
- **Input:** Primary/public/remove or organization notification operation with authorization and policy facts.
- **Success result:** `updated`.
- **Expected rejections:** `email-not-found`, `email-not-verified`, `managed-by-identity-provider`, `notification-domain-restricted`, `primary-email-required`, `sensitive-action-required`
- **Authorization:** Sudo mode for personal primary/public/removal; trusted organization policy for notification routing.
- **Transaction:** One context-local selection, removal/quarantine, or route upsert.
- **Idempotency:** Setting the existing selection is safe.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-account-emails-source-02`, `identity-account-emails-source-04`, `identity-account-emails-source-05`, `identity-account-emails-source-06`
- **Local policy:** Managed-user email is SCIM-owned; outside collaborators are exempt from organization-domain restriction.

## Ubiquitous language

- **Primary email:** Verified account address used as the principal address.
- **Public email:** Optional verified address exposed by public account views.
- **Notification route:** Per-organization verified delivery address.
- **Reuse quarantine:** Period in which a released address cannot be claimed.

## Ownership and invariants

An address belongs to at most one account. An account has at most one primary
and one public address. Managed accounts have one SCIM-owned address.

## Public capabilities

`server-api.ts` exposes four application boundaries to trusted server
composition.

## Dependencies and consistency

Verification delivery is synchronous through the notification-channel
contract. Address state remains authoritative here even if delivery fails.

## Authorization

Sensitive personal changes require a current sudo window. Managed changes are
accepted only from SCIM-owned composition.

## Persistence and transactions

PostgreSQL enforces unique normalized addresses and partial unique primary and
public selections. An in-memory adapter supports development and tests.

## Data classification

Email addresses are personal data. Verification tokens are secret and retained
only as SHA-256 hashes.

## Retention and erasure

Removal deletes active ownership and creates a 90-day quarantine record.
Organization routes cascade when an email is removed.

## Events and failure behavior

Expected policy failures use discriminated results. Product events remain
planned until publication is connected transactionally.

## Official sources

- <https://docs.github.com/en/account-and-profile/how-tos/email-preferences/adding-an-email-address-to-your-github-account>
- <https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address>
- <https://docs.github.com/en/account-and-profile/how-tos/email-preferences/verifying-your-email-address>
- <https://docs.github.com/en/rest/users/emails>
- <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/understanding-iam-for-enterprises/about-enterprise-managed-users>
- <https://docs.github.com/en/enterprise-cloud@latest/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/restricting-email-notifications-for-your-organization>

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json)
remains authoritative.
