# Stars

## Purpose

Own repository stars and future public star lists.

## Context content tree

- Repository stars [active]
  - `toggle-repository-star`
  - `list-repository-stargazers`
  - Owned: `RepositoryStar`
- Star lists [planned]
  - Owned: `StarList`, `StarListEntry`
- Planned events: `RepositoryStarred@1`, `RepositoryUnstarred@1`,
  `StarListCreated@1`, `StarListUpdated@1`, `StarListDeleted@1`,
  `StarListEntryAdded@1`, `StarListEntryRemoved@1`
- Runtime dependencies: none.
- Excludes: `RepositorySubscription`, `Notification`, `UserFollow`.

## Designed use cases

### `toggle-repository-star` [active]

- **Type:** `command`
- **Application boundary:** `ToggleRepositoryStarUseCase.toggleRepositoryStar()`
- **Public entrypoint:** `server-api.ts#toggleRepositoryStar`
- **Input:** Repository ID, actor account ID and username, and timestamp.
- **Success result:** `updated` with current star state.
- **Expected rejections:** `invalid-star`
- **Authorization:** Delivery establishes authenticated repository read access.
- **Transaction:** Add or remove one star through the context-owned PostgreSQL adapter.
- **Idempotency:** Not idempotent; each call toggles.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-stars-source-01`
- **Local policy:** Only personal authenticated accounts are delivered.

### `list-repository-stargazers` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositoryStargazersUseCase.listRepositoryStargazers()`
- **Public entrypoint:** `server-api.ts#listRepositoryStargazers`
- **Input:** Repository ID.
- **Success result:** `found` with stargazers newest first.
- **Expected rejections:** `invalid-repository-id`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `engagement-stars-source-01`
- **Local policy:** No private repository reference is returned without delivery access.

## Ubiquitous language

- **Repository star**: account's saved and appreciative repository relation.
- **Stargazer**: account with an active repository star.

## Ownership and invariants

Owns `RepositoryStar`, `StarList`, and `StarListEntry`. One account has at most
one active star per repository.

## Public capabilities

`toggleRepositoryStar` and `listRepositoryStargazers`.

## Dependencies and consistency

Delivery resolves repository state and permission before this context.

## Authorization

Only the authenticated actor mutates its own star.

## Persistence and transactions

Production composition stores stars in a context-owned PostgreSQL table. The
in-memory adapter remains an isolated development and test alternative.

## Data classification

Star relations are engagement data; private repository visibility is inherited.

## Retention and erasure

Star records are durable in PostgreSQL; visibility cleanup remains planned.

## Events and failure behavior

Events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars>
- <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility>
- <https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories>

## Exceptions

None.
