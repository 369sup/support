# Authentication

## Purpose

Own Supabase password and Google authentication, provider session
normalization, reauthentication, TOTP assurance, and external identity
onboarding. Account identity remains in `identity/accounts`.

## Context content tree

- Supabase Auth sessions [active]
  - `get-current-authenticated-session`
  - `sign-out-all-sessions`
  - Owned: `Session`
  - Invariants:
    - Supabase Auth is the only credential and session authority.
    - Support sessions contain the Support account ID, Supabase user ID,
      session ID, and AAL only.
    - `user_metadata` is never used for product authorization.
- Password lifecycle [active]
  - `request-supabase-password-reset`
  - `verify-supabase-otp`
  - `update-supabase-password`
  - Supabase owns reset tokens, password verifiers, and delivery.
  - Support normalizes results without revealing account existence.
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
- Additional authentication factors [active]
  - `enroll-totp`
  - `verify-mfa`
  - `reauthenticate`
  - Owned: `TwoFactorConfiguration`, `ExternalLoginBinding`
  - Supabase Auth owns factor secrets, challenges, nonces, and AAL.
  - Passkeys and recovery codes remain excluded from the active runtime.
  - Events: `TwoFactorEnabled@1`, `TwoFactorDisabled@1`,
    `ExternalLoginLinked@1`, `ExternalLoginUnlinked@1`
- Session events [planned]
  - `SessionCreated@1`, `SessionRevoked@1`
- External relationships
  - `identity/accounts::AccountReference` (synchronous)
- Excludes
  - `AccountLifecycle`, `ScimProvisioning`, `OAuthAppAuthorization`,
    `BrowserAccountSessionSet`, `Passkey`, `RecoveryCode`

## Designed use cases

### `update-supabase-password` [active]

- **Type:** `command`
- **Application boundary:** `UpdateSupabasePasswordUseCase.updateSupabasePassword()`
- **Public entrypoint:** `server-api.ts#updateSupabasePassword`
- **Input:** Authenticated Supabase session and new password after the required reauthentication or recovery flow.
- **Success result:** `changed`.
- **Expected rejections:** `service-unavailable`
- **Authorization:** Supabase Auth session, reauthentication nonce, and AAL are the only accepted security assertions.
- **Transaction:** Supabase Auth owns credential rotation; Support does not store password verifiers or password history.
- **Idempotency:** Provider result is normalized and no local credential state is written.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`, `identity-authentication-source-03`
- **Local policy:** Browser metadata is never accepted as a product authorization decision.

### `request-supabase-password-reset` [active]

- **Type:** `command`
- **Application boundary:** `RequestSupabasePasswordResetUseCase.requestSupabasePasswordReset()`
- **Public entrypoint:** `server-api.ts#requestSupabasePasswordReset`
- **Input:** Email address and allow-listed callback URL.
- **Success result:** `reset-requested`.
- **Expected rejections:** `none`
- **Authorization:** Public request with provider-normalized, account-existence-safe results.
- **Transaction:** Supabase Auth owns reset-token issuance and delivery.
- **Idempotency:** Repeated requests do not create Support credential state.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Support does not reveal whether the email maps to an account.

### `verify-supabase-otp` [active]

- **Type:** `command`
- **Application boundary:** `VerifySupabaseOtpUseCase.verifySupabaseOtp()`
- **Public entrypoint:** `server-api.ts#verifySupabaseOtp`
- **Input:** Supabase email token hash and OTP type.
- **Success result:** `verified` with a provider session suitable for the next operation.
- **Expected rejections:** `invalid-confirmation`, `service-unavailable`
- **Authorization:** Supabase Auth verifies the signed, single-use token.
- **Transaction:** Supabase Auth owns token consumption and session issuance.
- **Idempotency:** A consumed or expired token returns a normalized failure.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`, `identity-authentication-source-03`
- **Local policy:** Raw provider session and error types do not cross the package boundary.

### `get-current-authenticated-session` [active]

- **Type:** `query`
- **Application boundary:** `GetCurrentAuthenticatedSessionUseCase.getCurrentAuthenticatedSession()`
- **Public entrypoint:** `server-api.ts#getCurrentAuthenticatedSession`
- **Input:** Supabase SSR session cookie.
- **Success result:** `authenticated` with active session and account reference.
- **Expected rejections:** `authentication-required`
- **Authorization:** Supabase Auth validates the session before Support resolves the mapped account.
- **Transaction:** Read-only provider-session and PostgreSQL external-identity lookup.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Raw provider sessions and errors never cross the context boundary.

### `sign-out-all-sessions` [active]

- **Type:** `command`
- **Application boundary:** `SignOutAllSessionsUseCase.signOutAllSessions()`
- **Public entrypoint:** `server-api.ts#signOutAllSessions`
- **Input:** Current Supabase Auth session.
- **Success result:** `signed-out`.
- **Expected rejections:** `none`
- **Authorization:** Supabase Auth scopes global sign-out to the authenticated user.
- **Transaction:** Supabase Auth revokes the user's provider sessions; Support stores no session set.
- **Idempotency:** Repeated sign-out remains safe.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** HTTP clears the local SSR cookie after provider sign-out.

### `enroll-totp` [active]

- **Type:** `command`
- **Application boundary:** `EnrollTotpUseCase.enrollTotp()`
- **Public entrypoint:** `server-api.ts#enrollTotp`
- **Input:** Optional factor display name on an authenticated Supabase session.
- **Success result:** Provider-normalized TOTP enrollment details.
- **Expected rejections:** `invalid-factor`, `service-unavailable`
- **Authorization:** Authenticated Supabase session.
- **Transaction:** Supabase Auth creates and retains the factor secret.
- **Idempotency:** Provider factor identifiers prevent local duplication.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Support stores neither factor secrets nor recovery codes.

### `verify-mfa` [active]

- **Type:** `command`
- **Application boundary:** `VerifyMfaUseCase.verifyMfa()`
- **Public entrypoint:** `server-api.ts#verifyMfa`
- **Input:** Supabase factor ID, challenge ID, and verification code.
- **Success result:** `verified`.
- **Expected rejections:** `invalid-factor`, `invalid-verification`, `service-unavailable`
- **Authorization:** Current Supabase session and provider-issued challenge.
- **Transaction:** Supabase Auth verifies the challenge and advances the session AAL.
- **Idempotency:** Provider challenges enforce replay protection.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Provider errors are normalized and raw factor secrets never leave Supabase.

### `reauthenticate` [active]

- **Type:** `command`
- **Application boundary:** `ReauthenticateUseCase.reauthenticate()`
- **Public entrypoint:** `server-api.ts#reauthenticate`
- **Input:** Current Supabase session.
- **Success result:** Provider-normalized reauthentication result.
- **Expected rejections:** `invalid-factor`, `invalid-verification`, `service-unavailable`
- **Authorization:** Current Supabase session.
- **Transaction:** Supabase Auth issues and verifies the reauthentication nonce.
- **Idempotency:** Provider nonce semantics bound each attempt.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-01`
- **Local policy:** Sensitive operations consume only current provider assurance state.

## Ubiquitous language

- **Supabase session**: provider-owned browser authentication state represented by SSR cookies.
- **Assurance level (AAL)**: provider assertion describing the factors verified for the current session.
- **External login binding**: durable mapping between a Supabase identity and one Support account.

## Ownership and invariants

This context owns provider integration and normalized authentication contracts.
Supabase Auth owns credentials, sessions, factors, challenges, and assurance;
Support owns only the external identity mapping to an account. Account lifecycle
remains in `identity/accounts`.

## Public capabilities

`server-api.ts` exposes the active server operations, including
`startExternalSignIn`, `completeExternalSignIn`,
`getExternalAccountProvisioningState`, and
`completeExternalAccountProvisioning`.
`integration-contracts.ts` exposes `AuthenticatedSessionReference`.

## Dependencies and consistency

Account state is resolved synchronously through
`identity/accounts::AccountReference`. External identity mappings are stored in
PostgreSQL; credential, session, and factor mutations remain provider-owned.

## Authorization

Supabase SSR cookies identify authenticated browser sessions. Mutating Route
Handlers also enforce same-origin requests. Passwords and provider tokens are
never returned. Pending external users have no Support account or product
authorization, and callback destinations use an explicit same-site allowlist.

## Persistence and transactions

Supabase Auth is the production store for credentials, sessions, factors,
challenges, and assurance state. PostgreSQL stores the external identity
mapping used to resolve a Support account. Support stores no password verifier,
browser session set, TOTP secret, or recovery code. Process-local adapters
remain isolated unit-test fixtures and are never selected by runtime
configuration. Supabase Auth metadata is used only to complete verified
external-account provisioning; authorization never reads metadata.

## Data classification

Passwords, provider tokens, session cookies, factor secrets, and challenges are
secret. HTTP responses expose none of them. Account IDs and usernames are
public identifiers.

## Retention and erasure

Supabase Auth owns session, factor, challenge, and reset-token retention.
Sign-out clears the local SSR cookie after requesting provider revocation.
External identity mappings follow the account retention and erasure workflow.

## Events and failure behavior

The active slice emits no events; all catalog events remain planned. Expected
failures use discriminated results and infrastructure failures propagate.

## Official sources

- `identity-authentication-source-01`: <https://docs.github.com/en/authentication>
- `identity-authentication-source-02`: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/switching-between-accounts>

## Exceptions

None.
