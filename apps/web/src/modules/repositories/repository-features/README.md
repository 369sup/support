# Repository Features Bounded Context

- **Catalog path:** `repositories/repository-features`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Repository Issues, Discussions, Projects, and Wiki enablement with feature-specific configuration.

## Context content tree

- `repositories/repository-features` [planned]
  - Purpose: Repository Issues, Discussions, Projects, and Wiki enablement with feature-specific configuration.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `IssuesFeatureConfiguration`
    - `IssueCreationPolicy`
    - `RepositoryDiscussionsFeatureState`
    - `ProjectsFeatureConfiguration`
    - `RepositoryWikiFeatureState`
  - Business rules and invariants
    - `repository-issues-feature`: Repository Issues can be disabled while preserving existing issues and can restrict creation to collaborators.
    - `repository-discussions-feature`: Repository Discussions has repository-scoped enablement controlled by repository administrators.
    - `repository-projects-feature`: The repository Projects tab can be configured without deleting linked projects.
    - `repository-wiki-feature`: Repository Wikis can be disabled and re-enabled without erasing existing wiki content.
  - Published events
    - `RepositoryIssuesFeatureChanged@1` [planned]: repository Issues enablement or creation policy changed.
    - `RepositoryDiscussionsEnabled@1` [planned]: repository Discussions enabled.
    - `RepositoryDiscussionsDisabled@1` [planned]: repository Discussions disabled.
    - `RepositoryProjectsFeatureChanged@1` [planned]: repository Projects feature configuration changed.
    - `RepositoryWikiEnabled@1` [planned]: repository Wiki enabled.
    - `RepositoryWikiDisabled@1` [planned]: repository Wiki disabled without erasing its content.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleState` (synchronous)
    - `organizations/organization-policies::FeaturePolicyConstraints` (synchronous)
    - `commerce/entitlements::FeatureEntitlement` (synchronous)
    - `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)
- Explicit exclusions
  - `Actions`
  - `Pages`
  - `Packages`
  - `SecurityScanning`
  - `WikiContent`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `IssuesFeatureConfiguration`, `IssueCreationPolicy`, `RepositoryDiscussionsFeatureState`, `ProjectsFeatureConfiguration`, `RepositoryWikiFeatureState`.
It excludes `Actions`, `Pages`, `Packages`, `SecurityScanning`, `WikiContent`.

- `repository-issues-feature`: Repository Issues can be disabled while preserving existing issues and can restrict creation to collaborators.
  - Ownership: `IssuesFeatureConfiguration`, `IssueCreationPolicy`
  - Events: `RepositoryIssuesFeatureChanged@1`
  - Sources: `repositories-repository-features-source-01`
- `repository-discussions-feature`: Repository Discussions has repository-scoped enablement controlled by repository administrators.
  - Ownership: `RepositoryDiscussionsFeatureState`
  - Events: `RepositoryDiscussionsEnabled@1`, `RepositoryDiscussionsDisabled@1`
  - Sources: `repositories-repository-features-source-03`
- `repository-projects-feature`: The repository Projects tab can be configured without deleting linked projects.
  - Ownership: `ProjectsFeatureConfiguration`
  - Events: `RepositoryProjectsFeatureChanged@1`
  - Sources: `repositories-repository-features-source-04`
- `repository-wiki-feature`: Repository Wikis can be disabled and re-enabled without erasing existing wiki content.
  - Ownership: `RepositoryWikiFeatureState`
  - Events: `RepositoryWikiEnabled@1`, `RepositoryWikiDisabled@1`
  - Sources: `repositories-repository-features-source-05`

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleState` (synchronous)
- `organizations/organization-policies::FeaturePolicyConstraints` (synchronous)
- `commerce/entitlements::FeatureEntitlement` (synchronous)
- `repositories/repositories::RepositoryTransferEvents` (event; events `RepositoryTransferred@1`)

## Official sources

- `repositories-repository-features-source-01`: [issues enablement, collaborators-only issue creation, issue preservation while disabled](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-issues) (verified 2026-07-22)
- `repositories-repository-features-source-03`: [repository discussions enablement, repository admin enablement permission](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository) (verified 2026-07-22)
- `repositories-repository-features-source-04`: [repository Projects tab enablement, linked project preservation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-projects-in-a-repository) (verified 2026-07-22)
- `repositories-repository-features-source-02`: [feature loss after transfer, plan-dependent transfer effects](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository) (verified 2026-07-22)
- `repositories-repository-features-source-05`: [wiki enablement, wiki content preservation while disabled](https://docs.github.com/en/communities/documenting-your-project-with-wikis/disabling-wikis) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
