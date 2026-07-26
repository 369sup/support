# Repositories

## Purpose

Own GitHub-like Repository identity, owner, visibility, profile, and lifecycle
semantics. Active slices support personal and organization owner queries plus
trusted candidate retrieval for permission-aware projections.

## Context content tree

- Repository management
  - Public personal-owner repository listing [active]
    - Use case: `list-active-public-repositories-for-personal-owner`
    - Application boundary:
      `ListActivePublicRepositoriesForPersonalOwnerUseCase.listActivePublicRepositoriesForPersonalOwner()`
    - Owned concepts: `Repository`, `RepositoryDescription`,
      `RepositoryLifecycleState`
    - Rules and invariants:
      - The owner must be a personal account reference.
      - Only public repositories in the active lifecycle state are returned.
      - The context returns summaries without Git content or authorization
        grants.
    - Decisions: return a collection, including an empty collection when no
      repository matches.
    - Published events: none for this query-only active slice.
  - Public organization-owner repository listing [active]
    - Use case: `list-active-public-repositories-for-organization-owner`
    - Only active public repositories for the stable organization ID.
  - Trusted repository candidate queries [active]
    - Use case: `get-repository-by-owner-and-name`
    - Use case: `list-active-repositories-for-owner`
    - Private and internal candidates are never a visibility decision.
  - Repository identity and profile [planned]
    - Owned concept: `RepositoryHomepage`
    - Planned events: `RepositoryCreated@1`, `RepositoryProfileUpdated@1`
  - Repository rename and redirects [planned]
    - Owned concept: `RepositoryRedirect`
    - Planned event: `RepositoryRenamed@1`
  - Repository visibility [planned]
    - Planned event: `RepositoryVisibilityChanged@1`
  - Repository transfer [planned]
    - Owned concept: `RepositoryTransfer`
    - Planned events: `RepositoryTransferRequested@1`,
      `RepositoryTransferred@1`, `RepositoryTransferExpired@1`
  - Repository lifecycle [planned]
    - Owned concepts: `RepositoryTombstone`, `RepositoryRestoreWindow`
    - Planned events: `RepositoryArchived@1`, `RepositoryUnarchived@1`,
      `RepositoryDeleted@1`, `RepositoryRestored@1`
- External relationships
  - Active synchronous dependency:
    `identity/accounts::UserOwnerReference`
  - Active synchronous dependency:
    `organizations/organizations::OrganizationOwnerReference`
  - Planned synchronous relationships:
    `organizations/organization-policies::RepositoryPolicyConstraints`, and
    `commerce/entitlements::RepositoryEntitlement`
- Explicit exclusions
  - `GitObject`
  - `RepositoryGrant`
  - `Issue`
  - `Star`
  - `Subscription`

## Designed use cases

### `get-repository-by-owner-and-name` [active]

- **Type:** `query`
- **Application boundary:** `GetRepositoryByOwnerAndNameUseCase.getRepositoryByOwnerAndName()`
- **Public entrypoint:** `server-api.ts#getRepositoryByOwnerAndName`
- **Input:** Stable owner ID and repository name.
- **Success result:** `found` with active repository candidate.
- **Expected rejections:** `repository-not-found`
- **Authorization:** Trusted server callers must apply repository access before disclosure.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::UserOwnerReference`, `organizations/organizations::OrganizationOwnerReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-01`
- **Local policy:** Archived and deleted records are absent.

### `list-active-public-repositories-for-organization-owner` [active]

- **Type:** `query`
- **Application boundary:** `ListActivePublicRepositoriesForOrganizationOwnerUseCase.listActivePublicRepositoriesForOrganizationOwner()`
- **Public entrypoint:** `server-api.ts#listActivePublicRepositoriesForOrganizationOwner`
- **Input:** Stable organization-owner ID and login.
- **Success result:** Public repository summaries, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** None; only public repositories are returned.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `organizations/organizations::OrganizationOwnerReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-10`
- **Local policy:** Require organization ownership, public visibility, and active lifecycle.

### `list-active-public-repositories-for-personal-owner` [active]

- **Type:** `query`
- **Application boundary:** `ListActivePublicRepositoriesForPersonalOwnerUseCase.listActivePublicRepositoriesForPersonalOwner()`
- **Public entrypoint:** `server-api.ts#listActivePublicRepositoriesForPersonalOwner`
- **Input:** Stable personal-owner `accountId`.
- **Success result:** Read-only collection of public `RepositoryQuerySnapshot` values, including an empty collection.
- **Expected rejections:** `none`
- **Authorization:** None; only public repository summaries are exposed.
- **Transaction:** Read-only lookup with no transaction.
- **Idempotency:** Query; repeated input has no side effect.
- **Dependencies:** `identity/accounts::UserOwnerReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-11`
- **Local policy:** Resolve by stable account ID, require personal ownership, filter to `public` and `active`, and return a summary projection without Git content or grants.

### `list-active-repositories-for-owner` [active]

- **Type:** `query`
- **Application boundary:** `ListActiveRepositoriesForOwnerUseCase.listActiveRepositoriesForOwner()`
- **Public entrypoint:** `server-api.ts#listActiveRepositoriesForOwner`
- **Input:** Stable personal or organization owner ID.
- **Success result:** Active repository candidates, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** Trusted projection only; candidates are not visibility decisions.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::UserOwnerReference`, `organizations/organizations::OrganizationOwnerReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-10`
- **Local policy:** Every candidate must pass `repository-access` before user disclosure.

## Ubiquitous language

- **Repository**: the core GitHub product resource.
- **Personal owner**: an account referenced by stable account ID and username.
- **Organization owner**: an organization referenced by stable ID and login.
- **Visibility**: public, private, or internal repository access classification.
- **Lifecycle state**: active, archived, or deleted product state.

## Ownership and invariants

This context owns Repository identity, description, homepage, redirect,
transfer, and lifecycle semantics. The active query returns only repositories
whose personal owner matches the requested account and whose visibility is
`public` and lifecycle is `active`.

Git objects, grants, issues, stars, and subscriptions remain excluded.

## Public capabilities

- `listActivePublicRepositoriesForPersonalOwner(owner)` through
  `server-api.ts`.
- `ListActivePublicRepositoriesForPersonalOwnerUseCase.listActivePublicRepositoriesForPersonalOwner()`
  is the application boundary implemented by
  `ListActivePublicRepositoriesForPersonalOwnerHandler`.

The result contains public Repository summaries only. `server-api.ts` delegates
through a process-reused facade created by the private composition root;
consumers do not configure or select its adapter.

## Dependencies and consistency

This context synchronously consumes account and organization owner references
through framework-free integration contracts. It does not read their storage.

## Authorization

Public summaries require no authorization. Trusted private/internal candidate
queries require a separate `repository-access` decision before disclosure.

## Persistence and transactions

A context-local in-memory query adapter owns deterministic development
fixtures and owner/name indexes. Queries perform no writes.

## Data classification

Repository ID, public owner username, name, description, visibility, lifecycle
state, and update timestamp are public product data in this slice. No Git
content, collaborator data, or private metadata is stored or returned.

## Retention and erasure

Fixtures live for the process lifetime. Durable retention, tombstones, and
restore windows remain planned with their lifecycle commands.

## Events and failure behavior

This query-only activation emits no events. All catalog events remain planned.
Expected empty results return an empty collection; unexpected adapter failures
propagate as infrastructure errors.

## Official sources

- <https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories>
- <https://docs.github.com/en/repositories/creating-and-managing-repositories/viewing-all-your-repositories>
- <https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user>

## Exceptions

None.
