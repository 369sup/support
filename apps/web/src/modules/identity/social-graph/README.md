# Social Graph

## Purpose

Own following relationships between accounts and organizations.

## Context content tree

- User follow [active]
  - `toggle-user-follow`
  - Owned: `UserFollow`
- Organization follow [planned]
  - Owned: `OrganizationFollow`
- Planned events: `UserFollowed@1`, `UserUnfollowed@1`,
  `OrganizationFollowed@1`, `OrganizationUnfollowed@1`
- Runtime dependencies: none.
- Excludes: `RepositoryStar`, `RepositorySubscription`, `ActivityFeed`.

## Designed use cases

### `toggle-user-follow` [active]

- **Type:** `command`
- **Application boundary:** `ToggleUserFollowUseCase.toggleUserFollow()`
- **Public entrypoint:** `server-api.ts#toggleUserFollow`
- **Input:** Follower account ID and followed account ID.
- **Success result:** `updated` with current following state.
- **Expected rejections:** `invalid-follow`, `self-follow-not-allowed`
- **Authorization:** Delivery supplies the authenticated follower account ID.
- **Transaction:** Add or remove one durable PostgreSQL relation.
- **Idempotency:** Not idempotent; each call toggles the relation.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `identity-social-graph-source-01`
- **Local policy:** Self-follow is prohibited.

## Ubiquitous language

- **Follower**: account that receives another person's public activity.
- **Followed account**: personal account whose public activity may appear.

## Ownership and invariants

Owns `UserFollow` and `OrganizationFollow`. A user follow is directional and
cannot target the same account.

## Public capabilities

`toggleUserFollow` is exported by `server-api.ts`.

## Dependencies and consistency

Stable account IDs are supplied after delivery resolves both accounts.

## Authorization

The authenticated account can mutate only its own outgoing relationship.

## Persistence and transactions

Production relations are stored in PostgreSQL with a unique directional key.

## Data classification

Follow relationships are social profile data and respect private profile
presentation.

## Retention and erasure

Relations cascade when either participating account is erased.

## Events and failure behavior

Events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/get-started/exploring-projects-on-github/following-people>
- <https://docs.github.com/en/enterprise-cloud@latest/get-started/exploring-projects-on-github/following-organizations>

## Exceptions

None.
