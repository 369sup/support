# Authentication

## Purpose

Own Supabase password and Google authentication, browser session sets,
account-session lifecycle, external identity onboarding, and active account
selection. Account identity remains in `identity/accounts`.

## Context content tree

- Browser account sessions [active]
  - `get-current-authenticated-session`
  - `list-browser-account-sessions`
  - `switch-active-account-session`
  - `remove-account-session`
  - `sign-out-all-sessions`
  - Owned: `Credential`, `Session`
  - Invariants:
    - One browser token identifies one session set.
    - `activeSessionId` is null or references a session in that set.
    - Expired or revoked sessions cannot become active.
    - An expired managed-user session requires reauthentication.
- Password credential transaction protocol [active]
  - Use case: `apply-password-credential-transaction`
  - New passwords are converted to salted scrypt verifiers during prepare.
  - Prepared registration credentials cannot authenticate.
  - Username-change prepare locks password authentication until commit or rollback.
  - Commits remain reversible until the coordinator finalizes.
- Password maintenance [active]
  - `change-password`
  - `request-password-reset`
  - `reset-password`
  - Reset tokens expire after one hour and are stored only as hashes.
  - Password changes and completed resets revoke every account session.
  - The current password and five previous verifiers cannot be reused.
- External identity sign-in [active]
  - Google OAuth uses Supabase PKCE and requests only `openid`, email, and
    profile scopes.
  - Existing linked identities authenticate immediately.
  - A new verified Google identity remains pending until the user chooses a
    valid Support username.
  - Username completion atomically provisions the Support account, external
    identity, and primary email through a database trigger.
  - Identity linking is limited to Supabase automatic linking for the same
    verified email; manual cross-email linking is excluded.
  - Google entrypoints remain unavailable until the onboarding migration is
    recorded; existing password authentication continues on the base Auth
    migration during a staged rollout.
- Additional authentication factors [active]
  - `configure-totp`
  - `verify-additional-factor`
  - `manage-passkey`
  - `enter-sudo-mode`
  - `recover-two-factor`
  - Owned: `TwoFactorConfiguration`, `ExternalLoginBinding`
  - Events: `TwoFactorEnabled@1`, `TwoFactorDisabled@1`,
    `ExternalLoginLinked@1`, `ExternalLoginUnlinked@1`
- Session events [planned]
  - `SessionCreated@1`, `SessionRevoked@1`
- External relationships
  - `identity/accounts::AccountReference` (synchronous)
- Excludes
  - `AccountLifecycle`, `ScimProvisioning`, `OAuthAppAuthorization`

## Designed use cases

### `apply-password-credential-transaction` [active]

- **Type:** `command`
- **Application boundary:** `ApplyPasswordCredentialTransactionUseCase.applyPasswordCredentialTransaction()`
- **Public entrypoint:** `server-api.ts#applyPasswordCredentialTransaction`
- **Input:** Trusted coordinator transaction ID and registration or username-change transaction step.
- **Success result:** `prepared`, `committed`, `rolled-back`, or `finalized` with credential subject identifiers.
- **Expected rejections:** `credential-conflict`, `credential-not-found`, `password-rejected`, `transaction-not-found`
- **Authorization:** Internal account-registration coordinator only.
- **Transaction:** One password credential store with locked preparation and reversible commit metadata.
- **Idempotency:** Transaction IDs are single-use; missing or finalized IDs return `transaction-not-found`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`, `identity-authentication-source-03`
- **Local policy:** Newly supplied passwords in the legacy internal transaction protocol are retained only as salted scrypt verifiers.

### `change-password` [active]

- **Type:** `command`
- **Application boundary:** `ChangePasswordUseCase.changePassword()`
- **Public entrypoint:** `server-api.ts#changePassword`
- **Input:** Authenticated account ID, current password, new password, and trusted sudo-mode assertion.
- **Success result:** `changed`.
- **Expected rejections:** `credential-not-found`, `invalid-current-password`, `invalid-password`, `password-reused`, `sensitive-action-required`
- **Authorization:** Trusted authenticated boundary must prove sudo mode; browser input is not accepted as proof.
- **Transaction:** One credential rotation and bounded password-history update, followed by account-wide session revocation.
- **Idempotency:** A retry with the rotated current password fails without another mutation.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`, `identity-authentication-source-03`
- **Local policy:** Passwords require at least 12 characters and the five previous verifiers cannot be reused.

### `request-password-reset` [active]

- **Type:** `command`
- **Application boundary:** `RequestPasswordResetUseCase.requestPasswordReset()`
- **Public entrypoint:** `server-api.ts#requestPasswordReset`
- **Input:** Trusted account ID and verified delivery address.
- **Success result:** `reset-requested`.
- **Expected rejections:** `delivery-failed`, `invalid-request`
- **Authorization:** An account lookup boundary must resolve the account and email without exposing account existence.
- **Transaction:** Existing unconsumed token is replaced with a one-hour SHA-256 token hash before notification delivery.
- **Idempotency:** Delivery uses the account and token hash as an idempotency key.
- **Dependencies:** `platform/notification-channels::EmailDelivery`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** The raw reset token exists only in the delivery call and URL.

### `reset-password` [active]

- **Type:** `command`
- **Application boundary:** `ResetPasswordUseCase.resetPassword()`
- **Public entrypoint:** `server-api.ts#resetPassword`
- **Input:** Raw one-time reset token and new password.
- **Success result:** `reset`.
- **Expected rejections:** `invalid-password`, `invalid-reset-token`, `password-reused`, `reset-token-expired`
- **Authorization:** Possession of the unexpired single-use token.
- **Transaction:** Token row and credential are locked, password is rotated, and the token is consumed before account-wide session revocation.
- **Idempotency:** A consumed token returns `invalid-reset-token`.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`, `identity-authentication-source-03`
- **Local policy:** Completed resets revoke every account session.

### `get-current-authenticated-session` [active]

- **Type:** `query`
- **Application boundary:** `GetCurrentAuthenticatedSessionUseCase.getCurrentAuthenticatedSession()`
- **Public entrypoint:** `server-api.ts#getCurrentAuthenticatedSession`
- **Input:** Opaque browser token.
- **Success result:** `authenticated` with active session and account reference.
- **Expected rejections:** `authentication-required`
- **Authorization:** The browser token is the session-set credential.
- **Transaction:** Read-only except lazy expiry persistence.
- **Idempotency:** Query with deterministic expiry transition for a fixed clock.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Inactive accounts invalidate the session.

### `list-browser-account-sessions` [active]

- **Type:** `query`
- **Application boundary:** `ListBrowserAccountSessionsUseCase.listBrowserAccountSessions()`
- **Public entrypoint:** `server-api.ts#listBrowserAccountSessions`
- **Input:** Opaque browser token.
- **Success result:** `found` with account sessions and current-session marker.
- **Expected rejections:** `browser-session-not-found`
- **Authorization:** The browser token scopes the list.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Raw browser tokens are never returned through HTTP.

### `remove-account-session` [active]

- **Type:** `command`
- **Application boundary:** `RemoveAccountSessionUseCase.removeAccountSession()`
- **Public entrypoint:** `server-api.ts#removeAccountSession`
- **Input:** Browser token and session ID.
- **Success result:** `removed` with optional replacement current session.
- **Expected rejections:** `browser-session-not-found`, `session-not-found`
- **Authorization:** The browser token scopes the removal.
- **Transaction:** One session-set replacement or deletion.
- **Idempotency:** A second removal returns `session-not-found`.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Removing the last session deletes the browser set.

### `sign-out-all-sessions` [active]

- **Type:** `command`
- **Application boundary:** `SignOutAllSessionsUseCase.signOutAllSessions()`
- **Public entrypoint:** `server-api.ts#signOutAllSessions`
- **Input:** Opaque browser token.
- **Success result:** `signed-out`.
- **Expected rejections:** `browser-session-not-found`
- **Authorization:** The browser token scopes deletion.
- **Transaction:** Delete one browser session set.
- **Idempotency:** A second call returns `browser-session-not-found`.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** HTTP clears the cookie even if the process store was reset.

### `switch-active-account-session` [active]

- **Type:** `command`
- **Application boundary:** `SwitchActiveAccountSessionUseCase.switchActiveAccountSession()`
- **Public entrypoint:** `server-api.ts#switchActiveAccountSession`
- **Input:** Browser token and target session ID.
- **Success result:** `switched` with authenticated session reference.
- **Expected rejections:** `browser-session-not-found`, `session-not-found`, `session-not-switchable`, `reauthentication-required`
- **Authorization:** The target must belong to the identified browser set.
- **Transaction:** One active-session pointer update.
- **Idempotency:** Selecting the current active session is safe.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Expired managed sessions never change the active pointer.

### `configure-totp` [active]

- **Type:** `command`
- **Application boundary:** `ConfigureTotpUseCase.configureTotp()`
- **Public entrypoint:** `server-api.ts#configureTotp`
- **Input:** Account/username for enrollment or account/token for confirmation.
- **Success result:** `enrollment-started` or `enabled` with one-time recovery codes.
- **Expected rejections:** `configuration-not-found`, `invalid-account`, `invalid-token`, `token-reused`
- **Authorization:** Authenticated account in sudo mode.
- **Transaction:** Protected secret preparation followed by compare-and-set enablement and recovery-code replacement.
- **Idempotency:** A TOTP counter cannot be accepted twice.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Secrets are AES-256-GCM protected; recovery codes are stored only as hashes.

### `verify-additional-factor` [active]

- **Type:** `command`
- **Application boundary:** `VerifyAdditionalFactorUseCase.verifyAdditionalFactor()`
- **Public entrypoint:** `server-api.ts#verifyAdditionalFactor`
- **Input:** Account and TOTP token or one-time recovery code.
- **Success result:** `verified`.
- **Expected rejections:** `configuration-not-found`, `factor-not-required`, `invalid-factor`
- **Authorization:** Password-authenticated flow or current account session.
- **Transaction:** Compare-and-set TOTP counter or one-time recovery-code consumption.
- **Idempotency:** Successful factors cannot be replayed.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** TOTP drift window is one interval and rate limiting remains mandatory.

### `manage-passkey` [active]

- **Type:** `command`
- **Application boundary:** `ManagePasskeyUseCase.managePasskey()`
- **Public entrypoint:** `server-api.ts#managePasskey`
- **Input:** Registration or authentication step, account, challenge, and WebAuthn response.
- **Success result:** `options-created`, `passkey-registered`, or `verified`.
- **Expected rejections:** `challenge-expired`, `challenge-not-found`, `invalid-account`, `invalid-response`, `passkey-not-found`
- **Authorization:** Authenticated account for registration; challenge possession for authentication.
- **Transaction:** Single-use challenge consumption plus credential insert or counter advance.
- **Idempotency:** Challenges are single-use and credential counters never decrease.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** User verification is required and registration attestation is `none`.

### `enter-sudo-mode` [active]

- **Type:** `command`
- **Application boundary:** `EnterSudoModeUseCase.enterSudoMode()`
- **Public entrypoint:** `server-api.ts#enterSudoMode`
- **Input:** Account and TOTP or recovery-code factor.
- **Success result:** `entered` with a 15-minute expiry.
- **Expected rejections:** `configuration-not-found`, `invalid-factor`
- **Authorization:** Current account session.
- **Transaction:** Factor consumption/counter advance plus sudo expiry update.
- **Idempotency:** Each successful invocation creates a bounded new window.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Sensitive account changes must check the current sudo expiry.

### `recover-two-factor` [active]

- **Type:** `command`
- **Application boundary:** `RecoverTwoFactorUseCase.recoverTwoFactor()`
- **Public entrypoint:** `server-api.ts#recoverTwoFactor`
- **Input:** Account recovery request or completion with request ID.
- **Success result:** `recovery-requested` or `recovered`.
- **Expected rejections:** `configuration-not-found`, `hold-active`, `invalid-request`, `request-not-found`
- **Authorization:** Account recovery proof is coordinated outside this context.
- **Transaction:** Recovery request insert or compare-and-set completion followed by factor disablement.
- **Idempotency:** A completed request cannot be used again.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Completion has a mandatory 72-hour hold.

## Ubiquitous language

- **Browser session set**: account sessions retained for one opaque browser token.
- **Account session**: authentication state for one user account.
- **Active session**: the account session used by the current request.

## Ownership and invariants

This context owns credentials and sessions. It does not own account lifecycle.
All session-set mutations preserve the active-session membership invariant.

## Public capabilities

`server-api.ts` exposes the active server operations, including
`startExternalSignIn`, `completeExternalSignIn`,
`getExternalAccountProvisioningState`, and
`completeExternalAccountProvisioning`.
`integration-contracts.ts` exposes `AuthenticatedSessionReference`.

## Dependencies and consistency

Account state is resolved synchronously through
`identity/accounts::AccountReference`. Session-set writes are context-local;
Dashboard context restoration occurs after account switching.

## Authorization

Supabase SSR cookies identify authenticated browser sessions. Mutating Route
Handlers also enforce same-origin requests. Passwords and provider tokens are
never returned. Pending external users have no Support account or product
authorization, and callback destinations use an explicit same-site allowlist.

## Persistence and transactions

PostgreSQL is the production adapter for credentials, attempt windows, session
sets, TOTP configuration, recovery codes, challenges, and passkeys. Browser
tokens are stored only as SHA-256 hashes. Versioned process-local adapters
remain only as isolated unit-test fixtures and are never selected by the
password sign-in runtime. Supabase Auth metadata is used only to complete
verified external-account provisioning; authorization never reads metadata.

## Data classification

Passwords and opaque session tokens are secret. HTTP responses expose neither.
Account IDs and usernames are public identifiers.

## Retention and erasure

The cookie has a 30-day maximum age. Sign-out-all deletes the set and cookie.
Expired challenges and reset/recovery state are eligible for operator-owned
retention cleanup.

## Events and failure behavior

The active slice emits no events; all catalog events remain planned. Expected
failures use discriminated results and infrastructure failures propagate.

## Official sources

- `identity-authentication-source-01`: <https://docs.github.com/en/authentication>
- `identity-authentication-source-02`: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/switching-between-accounts>

## Exceptions

None.
