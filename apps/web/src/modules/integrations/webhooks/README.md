# Webhooks Bounded Context

- **Catalog path:** `integrations/webhooks`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Repository, organization, and enterprise webhook configuration plus GitHub App webhook projections, deliveries, attempts, and redelivery.

## Context content tree

- `integrations/webhooks` [planned]
  - Purpose: Repository, organization, and enterprise webhook configuration plus GitHub App webhook projections, deliveries, attempts, and redelivery.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `Webhook`
    - `WebhookEventSelection`
    - `WebhookSecretReference`
    - `GitHubAppWebhookEndpointProjection`
    - `WebhookDelivery`
    - `WebhookDeliveryAttempt`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `WebhookCreated@1` [planned]: webhook created.
    - `WebhookUpdated@1` [planned]: webhook updated.
    - `WebhookDeleted@1` [planned]: webhook deleted.
    - `WebhookDeliveryQueued@1` [planned]: webhook delivery queued.
    - `WebhookDeliverySucceeded@1` [planned]: webhook delivery succeeded.
    - `WebhookDeliveryFailed@1` [planned]: webhook delivery failed.
    - `WebhookRedelivered@1` [planned]: webhook redelivered.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `integrations/github-app-registrations::GitHubAppWebhookConfigurationEvents` (event; events `GitHubAppWebhookConfigurationChanged@1`)
    - `integrations/github-app-installations::InstallationWebhookScope` (synchronous)
    - `repositories/repositories::RepositoryWebhookTargetAndOperationalState` (synchronous)
    - `organizations/organizations::OrganizationWebhookTarget` (synchronous)
    - `enterprises/enterprises::EnterpriseWebhookTarget` (synchronous)
    - `organizations/organization-memberships::PublishedEventContract` (event; events `OrganizationMemberAdded@1`, `OrganizationMemberRemoved@1`, `OrganizationMemberRoleChanged@1`)
    - `repositories/repositories::PublishedEventContract` (event; events `RepositoryCreated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`, `RepositoryTransferred@1`)
    - `repositories/repository-access::PublishedEventContract` (event; events `RepositoryAccessGranted@1`, `RepositoryAccessChanged@1`, `RepositoryAccessRevoked@1`)
    - `collaboration/issues::PublishedEventContract` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`)
    - `collaboration/discussions::PublishedEventContract` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
    - `collaboration/projects::PublishedEventContract` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`)
    - `engagement/stars::PublishedEventContract` (event; events `RepositoryStarred@1`, `RepositoryUnstarred@1`)
    - `integrations/github-app-installations::PublishedEventContract` (event; events `GitHubAppInstalled@1`, `GitHubAppInstallationSuspended@1`, `GitHubAppInstallationUnsuspended@1`, `GitHubAppUninstalled@1`)
- Explicit exclusions
  - `DomainEvent`
  - `ArbitraryDatabasePolling`
  - `RawSecretStorage`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `Webhook`
- `WebhookEventSelection`
- `WebhookSecretReference`
- `GitHubAppWebhookEndpointProjection`
- `WebhookDelivery`
- `WebhookDeliveryAttempt`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `Webhook`, `WebhookEventSelection`, `WebhookSecretReference`, `GitHubAppWebhookEndpointProjection`, `WebhookDelivery`, `WebhookDeliveryAttempt`.
It excludes `DomainEvent`, `ArbitraryDatabasePolling`, `RawSecretStorage`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `integrations/github-app-registrations::GitHubAppWebhookConfigurationEvents` (event; events `GitHubAppWebhookConfigurationChanged@1`)
- `integrations/github-app-installations::InstallationWebhookScope` (synchronous)
- `repositories/repositories::RepositoryWebhookTargetAndOperationalState` (synchronous)
- `organizations/organizations::OrganizationWebhookTarget` (synchronous)
- `enterprises/enterprises::EnterpriseWebhookTarget` (synchronous)
- `organizations/organization-memberships::PublishedEventContract` (event; events `OrganizationMemberAdded@1`, `OrganizationMemberRemoved@1`, `OrganizationMemberRoleChanged@1`)
- `repositories/repositories::PublishedEventContract` (event; events `RepositoryCreated@1`, `RepositoryRenamed@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`, `RepositoryTransferred@1`)
- `repositories/repository-access::PublishedEventContract` (event; events `RepositoryAccessGranted@1`, `RepositoryAccessChanged@1`, `RepositoryAccessRevoked@1`)
- `collaboration/issues::PublishedEventContract` (event; events `IssueCreated@1`, `IssueUpdated@1`, `IssueClosed@1`, `IssueReopened@1`)
- `collaboration/discussions::PublishedEventContract` (event; events `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
- `collaboration/projects::PublishedEventContract` (event; events `ProjectCreated@1`, `ProjectUpdated@1`, `ProjectClosed@1`, `ProjectReopened@1`)
- `engagement/stars::PublishedEventContract` (event; events `RepositoryStarred@1`, `RepositoryUnstarred@1`)
- `integrations/github-app-installations::PublishedEventContract` (event; events `GitHubAppInstalled@1`, `GitHubAppInstallationSuspended@1`, `GitHubAppInstallationUnsuspended@1`, `GitHubAppUninstalled@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `WebhookCreated@1` (domain, planned): webhook created. contract and ordering pending activation.
- `WebhookUpdated@1` (domain, planned): webhook updated. contract and ordering pending activation.
- `WebhookDeleted@1` (domain, planned): webhook deleted. contract and ordering pending activation.
- `WebhookDeliveryQueued@1` (domain, planned): webhook delivery queued. contract and ordering pending activation.
- `WebhookDeliverySucceeded@1` (domain, planned): webhook delivery succeeded. contract and ordering pending activation.
- `WebhookDeliveryFailed@1` (domain, planned): webhook delivery failed. contract and ordering pending activation.
- `WebhookRedelivered@1` (domain, planned): webhook redelivered. contract and ordering pending activation.

## Official sources

- `integrations-webhooks-source-01`: [webhook events, payloads, webhook types](https://docs.github.com/en/webhooks/webhook-events-and-payloads) (verified 2026-07-22)
- `integrations-webhooks-source-02`: [deliveries, attempts, redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries) (verified 2026-07-22)
- `integrations-webhooks-source-03`: [GitHub App webhook projection, GitHub App webhook delivery configuration](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
