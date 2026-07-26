# Profiles

## Purpose

Own user-controlled personal profile presentation. The active slice reads a
profile and lets its owning account update public profile fields without
claiming durable persistence.

## Context content tree

- Personal profile [active]
  - Use case: `get-user-profile`
  - Use case: `update-user-profile`
  - Owned concepts: `UserProfile`, `ProfileVisibility`, `ProfileStatus`,
    `PinnedItemSet`, `ProfileAchievementSet`
  - Rules:
    - A profile belongs to exactly one account ID.
    - Only the owning account can update a profile.
    - Display name is required and bio is limited to 160 characters.
    - Public reads omit private-profile social presentation fields.
    - Hidden achievements are visible only to the profile owner.
    - Achievement source links are not exposed until their resource permission
      can be evaluated.
  - Published events remain planned until an event publisher and durable
    transaction boundary are activated.
  - Planned events: `ProfileUpdated@1`, `ProfileVisibilityChanged@1`,
    `ProfileStatusChanged@1`, `PinnedItemsChanged@1`.
- External relationships
  - Runtime dependencies: none.
  - Planned: `identity/accounts::AccountReference`.
- Explicit exclusions
  - `AccountLifecycle`
  - `RepositoryStar`
  - `Project`

## Designed use cases

### `get-user-profile` [active]

- **Type:** `query`
- **Application boundary:** `GetUserProfileUseCase.getUserProfile()`
- **Public entrypoint:** `server-api.ts#getUserProfile`
- **Input:** Account ID string and whether the requester is the profile owner.
- **Success result:** `found` with the permitted `UserProfile`.
- **Expected rejections:** `invalid-account-id`, `profile-not-found`
- **Authorization:** Public read policy owned here; private social fields are returned only to the owner.
- **Transaction:** Read-only context-local lookup.
- **Idempotency:** Query; repeated input has no side effect.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-profiles-source-01`
- **Local policy:** Public bio and display name remain visible for a private profile; status and pinned items are owner-only, hidden achievements are owner-only, and source event links remain omitted.

### `update-user-profile` [active]

- **Type:** `command`
- **Application boundary:** `UpdateUserProfileUseCase.updateUserProfile()`
- **Public entrypoint:** `server-api.ts#updateUserProfile`
- **Input:** Actor account ID, target account ID, display name, bio, location, pronouns, visibility, and status.
- **Success result:** `updated` with the stored `UserProfile`.
- **Expected rejections:** `forbidden`, `invalid-profile`, `profile-not-found`
- **Authorization:** Owner-only policy in the application handler.
- **Transaction:** One process-local profile record replacement.
- **Idempotency:** Replacing a profile with identical normalized values is idempotent.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-profiles-source-01`
- **Local policy:** Trim textual fields, require display name, and enforce the documented 160-character bio limit.

## Ubiquitous language

- **User profile**: user-controlled presentation attached to an account ID.
- **Private profile**: profile mode that hides social activity and presentation
  fields from other users.
- **Profile status**: optional availability message, emoji, and busy state.
- **Pinned items**: stable references highlighted by the profile owner.
- **Profile achievement**: a badge presentation earned from a supported product
  event; this slice does not calculate awards.

## Ownership and invariants

This context owns `UserProfile`, `ProfileVisibility`, `ProfileStatus`, and
`PinnedItemSet`, and `ProfileAchievementSet`. Profile identity uses an account
ID but this slice does not validate account lifecycle, own account identity, or
calculate achievement awards.

## Public capabilities

- `getUserProfile(input)` through `server-api.ts`.
- `updateUserProfile(input)` through `server-api.ts`.
- Boundary-safe profile and result types through `server-api.ts`.

## Dependencies and consistency

There is no active cross-context dependency. Delivery code resolves the account
and passes its stable ID. The planned `AccountReference` relationship remains
non-runtime until a shared durable adapter exists.

## Authorization

Reads are public after visibility filtering. Updates require the actor account
ID to equal the profile account ID. Authentication and session validation are
performed by the inbound delivery boundary before invoking the command.

## Persistence and transactions

The active adapter is a context-local process store initialized with
development fixtures. A single update replaces one record atomically within
that process. It is not durable or cross-instance consistent.

## Data classification

Display name, bio, location, pronouns, visibility, status, and pinned item
references and achievement visibility are profile data. The adapter stores no
email, credential, token, private contact data, or inaccessible event link.

## Retention and erasure

Fixtures live for the process lifetime. Durable retention, export, and erasure
remain blocked on the account lifecycle and persistence design.

## Events and failure behavior

Catalog profile events remain planned because this process-local slice has no
transactional event publisher. Expected validation, authorization, and absence
results are discriminated values; unexpected adapter failures propagate.

## Official sources

- <https://docs.github.com/en/account-and-profile/concepts/personal-profile>
- <https://docs.github.com/en/account-and-profile/reference/profile-reference>

Verified 2026-07-26.

## Exceptions

None.
