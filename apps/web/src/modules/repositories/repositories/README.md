# Repositories

## Purpose

Own GitHub-like Repository identity, owner, visibility, profile, and lifecycle
semantics. The first active slice lists active public repositories for a
personal owner.

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
  - Planned synchronous relationships:
    `organizations/organizations::OrganizationOwnerReference`,
    `organizations/organization-policies::RepositoryPolicyConstraints`, and
    `commerce/entitlements::RepositoryEntitlement`
- Explicit exclusions
  - `GitObject`
  - `RepositoryGrant`
  - `Issue`
  - `Star`
  - `Subscription`

## Ubiquitous language

- **Repository**: the core GitHub product resource.
- **Personal owner**: an account referenced by stable account ID and username.
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

The result contains public Repository summaries only.

## Dependencies and consistency

This context synchronously consumes
`identity/accounts::UserOwnerReference` through its framework-free integration
contract. It does not read identity storage or import identity internals.

## Authorization

Public active Repository summaries require no authorization. Private, internal,
archived, deleted, or permission-filtered queries are not active. The
client-side mock session boundary is UX scaffolding and is not treated as an
authorization decision.

## Persistence and transactions

The first slice uses a context-local in-memory query adapter with deterministic
development fixtures. It performs no writes and owns no transaction.

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

## Exceptions

None.
