# Repository Autolinks Bounded Context

- **Catalog path:** `integrations/repository-autolinks`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Repository-scoped autolink definitions for external resource references.

## Context content tree

- `integrations/repository-autolinks` [planned]
  - Purpose: Repository-scoped autolink definitions for external resource references.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryAutolink`
    - `AutolinkPrefix`
    - `AutolinkIdentifierFormat`
    - `AutolinkTargetTemplate`
  - Business rules and invariants
    - `repository-autolink-definition`: An administrator can configure an entitled repository autolink with a non-overlapping prefix, numeric or alphanumeric identifier format, and target URL containing the <num> placeholder.
    - `repository-autolink-deletion`: Repository autolinks can be deleted; no in-place update capability is claimed.
  - Published events
    - `RepositoryAutolinkCreated@1` [planned]: repository autolink created.
    - `RepositoryAutolinkDeleted@1` [planned]: repository autolink deleted.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
    - `repositories/repository-access::RepositoryAdministrationPermission` (synchronous)
    - `commerce/entitlements::RepositoryAutolinkEntitlement` (synchronous)
- Explicit exclusions
  - `ExternalResource`
  - `RepositoryContent`
  - `ContentRendering`

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryAutolink`
- `AutolinkPrefix`
- `AutolinkIdentifierFormat`
- `AutolinkTargetTemplate`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryAutolink`, `AutolinkPrefix`, `AutolinkIdentifierFormat`, `AutolinkTargetTemplate`.
It excludes `ExternalResource`, `RepositoryContent`, `ContentRendering`.

- `repository-autolink-definition`: An administrator can configure an entitled repository autolink with a non-overlapping prefix, numeric or alphanumeric identifier format, and target URL containing the <num> placeholder.
  - Ownership: `RepositoryAutolink`, `AutolinkPrefix`, `AutolinkIdentifierFormat`, `AutolinkTargetTemplate`
  - Events: `RepositoryAutolinkCreated@1`
  - Sources: `integrations-repository-autolinks-source-01`, `integrations-repository-autolinks-source-02`
- `repository-autolink-deletion`: Repository autolinks can be deleted; no in-place update capability is claimed.
  - Ownership: none
  - Events: `RepositoryAutolinkDeleted@1`
  - Sources: `integrations-repository-autolinks-source-02`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleState` (synchronous)
- `repositories/repository-access::RepositoryAdministrationPermission` (synchronous)
- `commerce/entitlements::RepositoryAutolinkEntitlement` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `RepositoryAutolinkCreated@1` (domain, planned): repository autolink created. contract and ordering pending activation.
- `RepositoryAutolinkDeleted@1` (domain, planned): repository autolink deleted. contract and ordering pending activation.

## Official sources

- `integrations-repository-autolinks-source-01`: [repository autolinks, non-overlapping prefixes, identifier formats, target template](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-autolinks-to-reference-external-resources) (verified 2026-07-23)
- `integrations-repository-autolinks-source-02`: [autolink list and read, autolink creation, autolink deletion, identifier format, target template](https://docs.github.com/en/rest/repos/autolinks) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
