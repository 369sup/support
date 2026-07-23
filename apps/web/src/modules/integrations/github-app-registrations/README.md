# Github App Registrations Bounded Context

- **Catalog path:** `integrations/github-app-registrations`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

GitHub App registration, ownership and ownership transfer, requested permissions, webhook preference, requested webhook events, and visibility.

## Context content tree

- `integrations/github-app-registrations` [planned]
  - Purpose: GitHub App registration, ownership and ownership transfer, requested permissions, webhook preference, requested webhook events, and visibility.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `GitHubAppRegistration`
    - `GitHubAppOwnerReference`
    - `GitHubAppPermissionRequest`
    - `GitHubAppWebhookPreference`
    - `RequestedWebhookEvents`
    - `WebhookActivationState`
  - Business rules and invariants
    - `github-app-registration`: GitHub Apps have registrations, owners, permission requests, and visibility settings.
    - `github-app-registration-update`: GitHub App registration updates include permissions and webhook configuration.
    - `github-app-ownership-transfer`: GitHub App registration ownership can be transferred to eligible accounts.
    - `github-app-registration-deletion`: Deleting a GitHub App registration removes its installations.
  - Published events
    - `GitHubAppRegistered@1` [planned]: app registered.
    - `GitHubAppUpdated@1` [planned]: app updated.
    - `GitHubAppDeleted@1` [planned]: GitHub App registration deleted and its installations invalidated.
    - `GitHubAppPermissionsChanged@1` [planned]: app permissions changed.
    - `GitHubAppWebhookConfigurationChanged@1` [planned]: app webhook configuration changed.
    - `GitHubAppOwnershipTransferred@1` [planned]: GitHub App registration ownership transferred.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `identity/accounts::UserAppOwner` (synchronous)
    - `organizations/organizations::OrganizationAppOwner` (synchronous)
    - `enterprises/enterprises::EnterpriseAppOwner` (synchronous)
    - `commerce/entitlements::AppEntitlement` (synchronous)
- Explicit exclusions
  - `AppInstallation`
  - `UserAuthorization`
  - `WebhookDelivery`

## Ubiquitous language

The catalog reserves these terms for this context:

- `GitHubAppRegistration`
- `GitHubAppOwnerReference`
- `GitHubAppPermissionRequest`
- `GitHubAppWebhookPreference`
- `RequestedWebhookEvents`
- `WebhookActivationState`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `GitHubAppRegistration`, `GitHubAppOwnerReference`, `GitHubAppPermissionRequest`, `GitHubAppWebhookPreference`, `RequestedWebhookEvents`, `WebhookActivationState`.
It excludes `AppInstallation`, `UserAuthorization`, `WebhookDelivery`.

- `github-app-registration`: GitHub Apps have registrations, owners, permission requests, and visibility settings.
  - Ownership: `GitHubAppRegistration`, `GitHubAppOwnerReference`, `GitHubAppPermissionRequest`
  - Events: `GitHubAppRegistered@1`
  - Sources: `integrations-github-app-registrations-source-01`
- `github-app-registration-update`: GitHub App registration updates include permissions and webhook configuration.
  - Ownership: `GitHubAppWebhookPreference`, `RequestedWebhookEvents`, `WebhookActivationState`
  - Events: `GitHubAppUpdated@1`, `GitHubAppPermissionsChanged@1`, `GitHubAppWebhookConfigurationChanged@1`
  - Sources: `integrations-github-app-registrations-source-03`
- `github-app-ownership-transfer`: GitHub App registration ownership can be transferred to eligible accounts.
  - Ownership: none
  - Events: `GitHubAppOwnershipTransferred@1`
  - Sources: `integrations-github-app-registrations-source-02`
- `github-app-registration-deletion`: Deleting a GitHub App registration removes its installations.
  - Ownership: none
  - Events: `GitHubAppDeleted@1`
  - Sources: `integrations-github-app-registrations-source-04`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `identity/accounts::UserAppOwner` (synchronous)
- `organizations/organizations::OrganizationAppOwner` (synchronous)
- `enterprises/enterprises::EnterpriseAppOwner` (synchronous)
- `commerce/entitlements::AppEntitlement` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `GitHubAppRegistered@1` (domain, planned): app registered. contract and ordering pending activation.
- `GitHubAppUpdated@1` (domain, planned): app updated. contract and ordering pending activation.
- `GitHubAppDeleted@1` (domain, planned): GitHub App registration deleted and its installations invalidated. contract and ordering pending activation.
- `GitHubAppPermissionsChanged@1` (domain, planned): app permissions changed. contract and ordering pending activation.
- `GitHubAppWebhookConfigurationChanged@1` (domain, planned): app webhook configuration changed. contract and ordering pending activation.
- `GitHubAppOwnershipTransferred@1` (domain, planned): GitHub App registration ownership transferred. contract and ordering pending activation.

## Official sources

- `integrations-github-app-registrations-source-01`: [app registration, app ownership, app permissions, app visibility](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app) (verified 2026-07-22)
- `integrations-github-app-registrations-source-02`: [GitHub App registration ownership transfer, eligible destination account types, transfer effects](https://docs.github.com/en/apps/maintaining-github-apps/transferring-ownership-of-a-github-app) (verified 2026-07-22)
- `integrations-github-app-registrations-source-03`: [GitHub App registration updates, permission changes, webhook configuration changes](https://docs.github.com/en/apps/maintaining-github-apps/modifying-a-github-app-registration) (verified 2026-07-22)
- `integrations-github-app-registrations-source-04`: [GitHub App registration deletion, installation removal after registration deletion](https://docs.github.com/en/apps/maintaining-github-apps/deleting-a-github-app) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
