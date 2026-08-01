# Github App Installations Bounded Context

- **Catalog path:** `integrations/github-app-installations`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

GitHub App installation targets, selected repositories, granted permissions, suspension, and uninstall lifecycle.

## Context content tree

- `integrations/github-app-installations` [planned]
  - Purpose: GitHub App installation targets, selected repositories, granted permissions, suspension, and uninstall lifecycle.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `AppInstallation`
    - `InstallationTargetReference`
    - `InstallationRepositorySelection`
    - `InstallationPermissionGrant`
  - Business rules and invariants
    - `github-app-installation`: GitHub App installations bind an app to a user or organization target with repository selection and an approved permission grant.
    - `github-app-installation-permission-approval`: A registration can request additional permissions, but an installation permission grant changes only after its owner approves; without approval the installation retains its current permissions.
    - `github-app-installation-suspension`: GitHub App installations can be suspended and unsuspended by authorized actors.
    - `github-app-installation-selection-and-removal`: Installation repository selection can change and installations can be removed.
  - Published events
    - `GitHubAppInstalled@1` [planned]: app installed.
    - `GitHubAppInstallationSuspended@1` [planned]: app suspended.
    - `GitHubAppInstallationUnsuspended@1` [planned]: app unsuspended.
    - `GitHubAppUninstalled@1` [planned]: app uninstalled.
    - `GitHubAppInstallationRepositorySelectionChanged@1` [planned]: installation repository selection changed.
    - `GitHubAppInstallationPermissionsChanged@1` [planned]: installation permission grant changed after the installation owner approved additional permissions.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `integrations/github-app-registrations::GitHubAppRegistrationReference` (synchronous)
    - `integrations/github-app-registrations::GitHubAppRegistrationLifecycleEvents` (event; events `GitHubAppDeleted@1`)
    - `identity/accounts::UserInstallationTarget` (synchronous)
    - `organizations/organizations::OrganizationInstallationTarget` (synchronous)
    - `repositories/repositories::InstallationRepositoryReference` (synchronous)
    - `repositories/repository-access::InstallationPermission` (synchronous)
- Explicit exclusions
  - `AppRegistration`
  - `OAuthAuthorization`
  - `RepositoryGrant`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `AppInstallation`
- `InstallationTargetReference`
- `InstallationRepositorySelection`
- `InstallationPermissionGrant`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `AppInstallation`, `InstallationTargetReference`, `InstallationRepositorySelection`, `InstallationPermissionGrant`.
It excludes `AppRegistration`, `OAuthAuthorization`, `RepositoryGrant`.

- `github-app-installation`: GitHub App installations bind an app to a user or organization target with repository selection and an approved permission grant.
  - Ownership: `AppInstallation`, `InstallationTargetReference`, `InstallationRepositorySelection`, `InstallationPermissionGrant`
  - Events: `GitHubAppInstalled@1`
  - Sources: `integrations-github-app-installations-source-01`
- `github-app-installation-permission-approval`: A registration can request additional permissions, but an installation permission grant changes only after its owner approves; without approval the installation retains its current permissions.
  - Ownership: none
  - Events: `GitHubAppInstallationPermissionsChanged@1`
  - Sources: `integrations-github-app-installations-source-04`
- `github-app-installation-suspension`: GitHub App installations can be suspended and unsuspended by authorized actors.
  - Ownership: none
  - Events: `GitHubAppInstallationSuspended@1`, `GitHubAppInstallationUnsuspended@1`
  - Sources: `integrations-github-app-installations-source-02`
- `github-app-installation-selection-and-removal`: Installation repository selection can change and installations can be removed.
  - Ownership: none
  - Events: `GitHubAppUninstalled@1`, `GitHubAppInstallationRepositorySelectionChanged@1`
  - Sources: `integrations-github-app-installations-source-03`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `integrations/github-app-registrations::GitHubAppRegistrationReference` (synchronous)
- `integrations/github-app-registrations::GitHubAppRegistrationLifecycleEvents` (event; events `GitHubAppDeleted@1`)
- `identity/accounts::UserInstallationTarget` (synchronous)
- `organizations/organizations::OrganizationInstallationTarget` (synchronous)
- `repositories/repositories::InstallationRepositoryReference` (synchronous)
- `repositories/repository-access::InstallationPermission` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `GitHubAppInstalled@1` (domain, planned): app installed. contract and ordering pending activation.
- `GitHubAppInstallationSuspended@1` (domain, planned): app suspended. contract and ordering pending activation.
- `GitHubAppInstallationUnsuspended@1` (domain, planned): app unsuspended. contract and ordering pending activation.
- `GitHubAppUninstalled@1` (domain, planned): app uninstalled. contract and ordering pending activation.
- `GitHubAppInstallationRepositorySelectionChanged@1` (domain, planned): installation repository selection changed. contract and ordering pending activation.
- `GitHubAppInstallationPermissionsChanged@1` (domain, planned): installation permission grant changed after the installation owner approved additional permissions. contract and ordering pending activation.

## Official sources

- `integrations-github-app-installations-source-01`: [app installation, installation targets, repository selection, installation lifecycle](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app) (verified 2026-07-22)
- `integrations-github-app-installations-source-02`: [installation suspension, installation unsuspension, suspending actor authority](https://docs.github.com/en/apps/maintaining-github-apps/suspending-a-github-app-installation) (verified 2026-07-22)
- `integrations-github-app-installations-source-03`: [installation repository selection, installation suspension by target owner, installation uninstall](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps) (verified 2026-07-22)
- `integrations-github-app-installations-source-04`: [additional installation permission requests, installation-owner permission approval, retaining existing permissions without approval](https://docs.github.com/en/apps/using-github-apps/approving-updated-permissions-for-a-github-app) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
