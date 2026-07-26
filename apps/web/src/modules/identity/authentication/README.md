# Authentication

## Purpose

Own development credentials, browser session sets, account-session lifecycle,
and active account selection. Account identity remains in `identity/accounts`.

## Context content tree

- Browser account sessions [active]
  - `create-development-session`
  - `get-current-authenticated-session`
  - `list-browser-account-sessions`
  - `switch-active-account-session`
  - `remove-account-session`
  - `sign-out-all-sessions`
  - `expire-session`
  - `reauthenticate-session`
  - Owned: `Credential`, `Session`
  - Invariants:
    - One browser token identifies one session set.
    - `activeSessionId` is null or references a session in that set.
    - Expired or revoked sessions cannot become active.
    - An expired managed-user session requires reauthentication.
- Additional authentication factors [planned]
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

### `create-development-session` [active]

- **Type:** `command`
- **Application boundary:** `CreateDevelopmentSessionUseCase.createDevelopmentSession()`
- **Public entrypoint:** `server-api.ts#createDevelopmentSession`
- **Input:** Optional browser token plus development username and password.
- **Success result:** `created` with opaque browser token and authenticated session reference.
- **Expected rejections:** `invalid-credentials`, `account-unavailable`
- **Authorization:** Development credential verification owned here.
- **Transaction:** One browser session-set replacement.
- **Idempotency:** Reauthentication replaces the same account session in the set.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Available only in development and explicit E2E runtime.

### `expire-session` [active]

- **Type:** `command`
- **Application boundary:** `ExpireSessionUseCase.expireSession()`
- **Public entrypoint:** `server-api.ts#expireSession`
- **Input:** Browser token and session ID.
- **Success result:** `expired`.
- **Expected rejections:** `browser-session-not-found`, `session-not-found`
- **Authorization:** Development-only authenticated browser set.
- **Transaction:** One session-set replacement.
- **Idempotency:** Repeated expiration preserves expired state.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Test support only.

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

### `reauthenticate-session` [active]

- **Type:** `command`
- **Application boundary:** `ReauthenticateSessionUseCase.reauthenticateSession()`
- **Public entrypoint:** `server-api.ts#reauthenticateSession`
- **Input:** Browser token, session ID, and development password.
- **Success result:** `reauthenticated` with refreshed session.
- **Expected rejections:** `browser-session-not-found`, `session-not-found`, `invalid-credentials`, `account-unavailable`
- **Authorization:** Development credential verification owned here.
- **Transaction:** One session-set replacement.
- **Idempotency:** Repeated success refreshes authentication time.
- **Dependencies:** `identity/accounts::AccountReference`
- **Published events:** `none`
- **Official evidence:** `identity-authentication-source-02`
- **Local policy:** Reauthentication does not silently switch the active account.

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

## Ubiquitous language

- **Browser session set**: account sessions retained for one opaque browser token.
- **Account session**: authentication state for one user account.
- **Active session**: the account session used by the current request.

## Ownership and invariants

This context owns credentials and sessions. It does not own account lifecycle.
All session-set mutations preserve the active-session membership invariant.

## Public capabilities

`server-api.ts` exposes the eight active operations.
`integration-contracts.ts` exposes `AuthenticatedSessionReference`.

## Dependencies and consistency

Account state is resolved synchronously through
`identity/accounts::AccountReference`. Session-set writes are context-local;
Dashboard context restoration occurs after account switching.

## Authorization

The opaque HttpOnly cookie identifies the browser set. Mutating Route Handlers
also enforce same-origin requests. Development credentials are never returned.

## Persistence and transactions

A versioned process-local Map is used only for development and explicit E2E.
Each command replaces or deletes one session set. There is no cross-process
consistency.

## Data classification

Passwords and opaque session tokens are secret. HTTP responses expose neither.
Account IDs and usernames are public identifiers.

## Retention and erasure

The cookie has a 30-day maximum age. Process restart invalidates all tokens;
sign-out-all deletes the set and cookie.

## Events and failure behavior

The active slice emits no events; all catalog events remain planned. Expected
failures use discriminated results and infrastructure failures propagate.

## Official sources

- `identity-authentication-source-01`: <https://docs.github.com/en/authentication>
- `identity-authentication-source-02`: <https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/switching-between-accounts>

## Exceptions

The password credential adapter and expire/reauthenticate operations are
development/E2E-only.
