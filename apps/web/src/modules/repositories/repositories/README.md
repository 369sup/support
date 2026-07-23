# Repositories

## Purpose

Own GitHub-like Repository identity, owner, visibility, profile, and lifecycle
semantics. The first active slice lists active public repositories for a
personal owner.

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
