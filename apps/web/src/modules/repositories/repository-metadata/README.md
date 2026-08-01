# Repository Metadata Bounded Context

- **Catalog path:** `repositories/repository-metadata`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Repository topics and social-media preview configuration.

## Context content tree

- `repositories/repository-metadata` [planned]
  - Purpose: Repository topics and social-media preview configuration.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryTopicSet`
    - `RepositorySocialPreview`
  - Business rules and invariants
    - `repository-topic-set`: A repository can have up to 20 topics; each topic is at most 50 characters, uses lowercase letters, numbers, and hyphens, and its name is public even for a private repository.
    - `repository-social-preview`: Repository social-preview images can be changed or removed subject to GitHub's image format, size, and repository-visibility restrictions.
  - Published events
    - `RepositoryTopicsChanged@1` [planned]: repository topics changed.
    - `RepositorySocialPreviewChanged@1` [planned]: repository social preview changed.
    - `RepositorySocialPreviewRemoved@1` [planned]: repository social preview removed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
    - `platform/media-storage::MediaReference` (synchronous)
- Explicit exclusions
  - `RepositoryDescription`
  - `RepositoryHomepage`
  - `CustomPropertyDefinition`
  - `RepositoryPropertyValue`
  - `RepositoryContent`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `RepositoryTopicSet`, `RepositorySocialPreview`.
It excludes `RepositoryDescription`, `RepositoryHomepage`, `CustomPropertyDefinition`, `RepositoryPropertyValue`, `RepositoryContent`.

- `repository-topic-set`: A repository can have up to 20 topics; each topic is at most 50 characters, uses lowercase letters, numbers, and hyphens, and its name is public even for a private repository.
  - Ownership: `RepositoryTopicSet`
  - Events: `RepositoryTopicsChanged@1`
  - Sources: `repositories-repository-metadata-source-01`
- `repository-social-preview`: Repository social-preview images can be changed or removed subject to GitHub's image format, size, and repository-visibility restrictions.
  - Ownership: `RepositorySocialPreview`
  - Events: `RepositorySocialPreviewChanged@1`, `RepositorySocialPreviewRemoved@1`
  - Sources: `repositories-repository-metadata-source-02`

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleState` (synchronous)
- `platform/media-storage::MediaReference` (synchronous)

## Official sources

- `repositories-repository-metadata-source-01`: [topics, topic limits, public topic names](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics) (verified 2026-07-23)
- `repositories-repository-metadata-source-02`: [social-media preview, preview image restrictions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
