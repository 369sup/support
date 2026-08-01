# Repositories

## Purpose

Own GitHub-like Repository identity, owner, visibility, profile, and lifecycle
semantics. Active slices support personal and organization owner queries,
trusted candidates, empty repository creation, rename, visibility, archive,
delete, restore, and repository profile updates without Git content.

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
  - Authorized repository views [active]
    - Use case: `get-repository-for-viewing`
    - Use case: `list-visible-repositories-for-owner`
    - Active and archived repositories require a `repository-access` decision.
  - Repository identity and profile [active]
    - Use case: `create-empty-repository`
    - Use case: `get-repository-for-administration`
    - Use case: `update-repository-profile`
    - Owned concept: `RepositoryHomepage`
    - Active event: `RepositoryProfileUpdated@1`
    - Planned event: `RepositoryCreated@1`
  - Repository rename [active]
    - Use case: `rename-repository`
    - Owned concept: `RepositoryRedirect`
    - Planned event: `RepositoryRenamed@1`
  - Repository visibility [active]
    - Use case: `change-repository-visibility`
    - Planned event: `RepositoryVisibilityChanged@1`
  - Repository transfer [planned]
    - Owned concept: `RepositoryTransfer`
    - Planned events: `RepositoryTransferRequested@1`,
      `RepositoryTransferred@1`, `RepositoryTransferExpired@1`
  - Repository lifecycle [active]
    - Use case: `archive-repository`
    - Use case: `unarchive-repository`
    - Use case: `delete-repository`
    - Use case: `restore-deleted-repository`
    - Use case: `list-deleted-repositories-for-restoration`
    - Owned concepts: `RepositoryTombstone`, `RepositoryRestoreWindow`
    - Planned events: `RepositoryArchived@1`, `RepositoryUnarchived@1`,
      `RepositoryDeleted@1`, `RepositoryRestored@1`
- External relationships
  - Active synchronous dependency:
    `identity/accounts::AccountReference`
  - Active synchronous dependency:
    `organizations/organizations::OrganizationOwnerReference`
  - Active synchronous dependency:
    `organizations/organization-memberships::OrganizationMembershipReference`
  - Active synchronous dependency:
    `repositories/repository-access::EffectiveRepositoryPermissionDecision`
  - Active synchronous dependency:
    `platform/event-publication::EventRecorderPort`
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

### `create-empty-repository` [active]

- **Type:** `command`
- **Application boundary:** `CreateEmptyRepositoryUseCase.createEmptyRepository()`
- **Public entrypoint:** `server-api.ts#createEmptyRepository`
- **Input:** Authenticated actor, stable personal or organization owner ID, name, description, and public or private visibility.
- **Success result:** `created` with an active empty repository management record.
- **Expected rejections:** `permission-denied`, `invalid-name`, `invalid-description`, `invalid-visibility`, `internal-visibility-not-available`, `repository-name-conflict`
- **Authorization:** A personal account may create for itself; an organization requires an active owner membership.
- **Transaction:** Repository record and case-insensitive owner/name index update together in one process-local write.
- **Idempotency:** Not idempotent; an owner/name conflict prevents duplicate creation.
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationOwnerReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-02`
- **Local policy:** Creates no Git repository, branch, commit, file, template, README, license, gitignore, import, or code object; new internal repositories remain gated until enterprise entitlement is trustworthy.

### `get-repository-for-administration` [active]

- **Type:** `query`
- **Application boundary:** `GetRepositoryForAdministrationUseCase.getRepositoryForAdministration()`
- **Public entrypoint:** `server-api.ts#getRepositoryForAdministration`
- **Input:** Authenticated actor, stable owner ID, and repository name.
- **Success result:** `found` with active, archived, or deleted repository management state.
- **Expected rejections:** `permission-denied`, `repository-not-found`
- **Authorization:** Effective `admin` repository permission, including personal owner, organization owner, and active team or organization-role contributions.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-01`
- **Local policy:** This privileged query is the only route-facing lookup that can retrieve a deleted tombstone.

### `get-repository-for-viewing` [active]

- **Type:** `query`
- **Application boundary:** `GetRepositoryForViewingUseCase.getRepositoryForViewing()`
- **Public entrypoint:** `server-api.ts#getRepositoryForViewing`
- **Input:** Authenticated actor, stable owner ID, and repository name.
- **Success result:** `found` with an authorized active or archived repository view and effective permission.
- **Expected rejections:** `repository-not-found`
- **Authorization:** `repository-access` resolves visibility and effective permission; denied and absent resources are normalized to the same result.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-01`, `repositories-repositories-source-05`
- **Local policy:** Deleted tombstones are never exposed through a repository resource URL.

### `list-deleted-repositories-for-restoration` [active]

- **Type:** `query`
- **Application boundary:** `ListDeletedRepositoriesForRestorationUseCase.listDeletedRepositoriesForRestoration()`
- **Public entrypoint:** `server-api.ts#listDeletedRepositoriesForRestoration`
- **Input:** Authenticated actor and stable personal or organization owner ID.
- **Success result:** `found` with deleted repositories, restore deadlines, and current eligibility.
- **Expected rejections:** `permission-denied`
- **Authorization:** A personal owner may inspect its own tombstones; an organization requires active owner membership.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationOwnerReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-07`
- **Local policy:** Repository admins who do not own the personal or organization account cannot restore deleted repositories.

### `update-repository-profile` [active]

- **Type:** `command`
- **Application boundary:** `UpdateRepositoryProfileUseCase.updateRepositoryProfile()`
- **Public entrypoint:** `server-api.ts#updateRepositoryProfile`
- **Input:** Authenticated actor, stable owner ID, repository name, description, and optional homepage URL.
- **Success result:** `profile-updated` with the active repository, including an idempotent unchanged result.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `invalid-state`, `invalid-description`, `invalid-homepage`
- **Authorization:** Effective `admin` repository permission from `repository-access`.
- **Transaction:** Repository profile fields and the context-local `RepositoryProfileUpdated@1` outbox record complete before success.
- **Idempotency:** Repeating the current description and homepage succeeds without recording another event.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`, `platform/event-publication::EventRecorderPort`
- **Published events:** `RepositoryProfileUpdated@1`
- **Official evidence:** `repositories-repositories-source-05`, `repositories-repositories-source-09`
- **Local policy:** Description is trimmed and limited to 350 characters; an empty homepage clears it, otherwise only an absolute HTTP or HTTPS URL is accepted. Archived and deleted repositories must return to active state before profile changes.

### `rename-repository` [active]

- **Type:** `command`
- **Application boundary:** `RenameRepositoryUseCase.renameRepository()`
- **Public entrypoint:** `server-api.ts#renameRepository`
- **Input:** Authorized actor, stable owner ID, current name, and new name.
- **Success result:** `renamed` with the same active repository ID and new canonical name.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `invalid-state`, `invalid-name`, `repository-name-conflict`
- **Authorization:** Effective `admin` repository permission.
- **Transaction:** Repository and case-insensitive owner/name index change together.
- **Idempotency:** Repeating the current name is an idempotent update.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-08`
- **Local policy:** Archived repositories must first be unarchived; redirect history remains deferred.

### `change-repository-visibility` [active]

- **Type:** `command`
- **Application boundary:** `ChangeRepositoryVisibilityUseCase.changeRepositoryVisibility()`
- **Public entrypoint:** `server-api.ts#changeRepositoryVisibility`
- **Input:** Authorized actor, stable owner ID, repository name, and target visibility.
- **Success result:** `visibility-changed` with the active repository.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `invalid-state`, `invalid-visibility`, `internal-visibility-not-available`
- **Authorization:** Effective `admin` repository permission.
- **Transaction:** One repository record update.
- **Idempotency:** Repeating the current visibility is idempotent.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-04`
- **Local policy:** Public and private transitions are active; an existing internal fixture may remain internal, but entry into internal visibility is gated.

### `archive-repository` [active]

- **Type:** `command`
- **Application boundary:** `ArchiveRepositoryUseCase.archiveRepository()`
- **Public entrypoint:** `server-api.ts#archiveRepository`
- **Input:** Authorized actor, stable owner ID, repository name, and exact owner/name confirmation.
- **Success result:** `archived` with a read-only lifecycle state.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `confirmation-mismatch`, `invalid-state`
- **Authorization:** Effective `admin` repository permission.
- **Transaction:** One repository lifecycle update.
- **Idempotency:** State-guarded; already archived returns `invalid-state`.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-05`
- **Local policy:** Exact full-name confirmation is required and archived management records cannot be renamed or change visibility.

### `unarchive-repository` [active]

- **Type:** `command`
- **Application boundary:** `UnarchiveRepositoryUseCase.unarchiveRepository()`
- **Public entrypoint:** `server-api.ts#unarchiveRepository`
- **Input:** Authorized actor, stable owner ID, repository name, and exact owner/name confirmation.
- **Success result:** `unarchived` with active lifecycle state.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `confirmation-mismatch`, `invalid-state`
- **Authorization:** Effective `admin` repository permission.
- **Transaction:** One repository lifecycle update.
- **Idempotency:** State-guarded; active repositories return `invalid-state`.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-05`
- **Local policy:** Exact full-name confirmation is required.

### `delete-repository` [active]

- **Type:** `command`
- **Application boundary:** `DeleteRepositoryUseCase.deleteRepository()`
- **Public entrypoint:** `server-api.ts#deleteRepository`
- **Input:** Authorized actor, stable owner ID, repository name, and exact owner/name confirmation.
- **Success result:** `deleted` with deletion time and 90-day restore deadline.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `confirmation-mismatch`, `invalid-state`
- **Authorization:** Effective `admin` repository permission.
- **Transaction:** Repository becomes a tombstone in one process-local update.
- **Idempotency:** State-guarded; deleted repositories return `invalid-state`.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-06`
- **Local policy:** Active or archived repositories may be deleted; full-name confirmation is mandatory.

### `restore-deleted-repository` [active]

- **Type:** `command`
- **Application boundary:** `RestoreDeletedRepositoryUseCase.restoreDeletedRepository()`
- **Public entrypoint:** `server-api.ts#restoreDeletedRepository`
- **Input:** Authorized actor, stable owner ID, deleted repository name, and exact owner/name confirmation.
- **Success result:** `restored` with active lifecycle state and a new authorization subject ID.
- **Expected rejections:** `permission-denied`, `repository-not-found`, `confirmation-mismatch`, `invalid-state`, `restore-window-expired`
- **Authorization:** Personal-account owner or active organization owner; repository admin alone is insufficient.
- **Transaction:** Tombstone replacement and owner/name index update together.
- **Idempotency:** State-guarded; restored repositories return `invalid-state`.
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationOwnerReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-07`
- **Local policy:** Restore is available through exactly 90 days; the new authorization subject ID ensures prior team permissions are not restored.

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
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationOwnerReference`
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
- **Dependencies:** `identity/accounts::AccountReference`
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
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationOwnerReference`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-10`
- **Local policy:** Every candidate must pass `repository-access` before user disclosure.

### `list-visible-repositories-for-owner` [active]

- **Type:** `query`
- **Application boundary:** `ListVisibleRepositoriesForOwnerUseCase.listVisibleRepositoriesForOwner()`
- **Public entrypoint:** `server-api.ts#listVisibleRepositoriesForOwner`
- **Input:** Authenticated actor and stable personal or organization owner ID.
- **Success result:** Authorized active and archived repository list items, possibly empty.
- **Expected rejections:** `none`
- **Authorization:** Every non-deleted candidate passes `repository-access`; denied candidates are omitted.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `repositories-repositories-source-05`, `repositories-repositories-source-10`
- **Local policy:** Deleted tombstones are excluded; archived repositories remain discoverable and visibly read-only.

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
- `getRepositoryForViewing(query)`, `listVisibleRepositoriesForOwner(query)`,
  and `listDeletedRepositoriesForRestoration(query)` through `server-api.ts`.
- `updateRepositoryProfile(command)` through `server-api.ts`.
- `ListActivePublicRepositoriesForPersonalOwnerUseCase.listActivePublicRepositoriesForPersonalOwner()`
  is the application boundary implemented by
  `ListActivePublicRepositoriesForPersonalOwnerHandler`.

The result contains public Repository summaries only. `server-api.ts` delegates
through a process-reused facade created by the private composition root;
consumers do not configure or select its adapter.

## Dependencies and consistency

This context synchronously consumes account and organization owner references,
effective repository administration decisions, and the event recorder through
framework-free public contracts. It does not read another context's storage.

## Authorization

Public summaries require no authorization. Trusted private/internal candidate
queries require a separate `repository-access` decision before disclosure.
Administration queries and mutations require effective `admin` permission.

## Persistence and transactions

A context-local in-memory adapter owns deterministic development fixtures,
repository tombstones, and case-insensitive owner/name indexes. Profile changes
also record a context-owned outbox envelope before returning success. Both
stores remain process-local and non-durable.

## Data classification

Repository ID, public owner username, name, description, homepage, visibility,
lifecycle state, and update timestamp are public product data in this slice. No
Git content, collaborator data, or private metadata is stored or returned.

## Retention and erasure

Fixtures and mutations live for the process lifetime. Deleted records retain a
90-day restore deadline; durable erasure scheduling remains deferred.

## Events and failure behavior

Material profile changes increment the context-owned aggregate version and
record `RepositoryProfileUpdated@1` with `repositoryId` ordering. The platform
publisher owns leasing, retry, and dead-letter behavior; this context retains
the source outbox. Expected empty results return an empty collection, and
unexpected adapter failures propagate as infrastructure errors.

## Official sources

- <https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories>
- <https://docs.github.com/en/rest/repos/repos>
- <https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories>
- <https://docs.github.com/en/repositories/creating-and-managing-repositories/viewing-all-your-repositories>
- <https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user>

## Exceptions

None.
