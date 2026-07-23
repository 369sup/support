# Repository Insights Bounded Context

- **Catalog path:** `projections/repository-insights`
- **Kind:** `projection`
- **Classification:** `not-applicable`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Non-code repository engagement trends and integration-health projections.

## Context content tree

- `projections/repository-insights` [planned]
  - Purpose: Non-code repository engagement trends and integration-health projections.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryInsight`
    - `EngagementMetric`
    - `IntegrationHealthMetric`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - None. Read-model context consumes versioned events and does not publish product facts.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryInsightEvents` (event; events `RepositoryCreated@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`)
    - `collaboration/issues::IssueMetricEvents` (event; events `IssueCreated@1`, `IssueClosed@1`, `IssueReopened@1`)
    - `collaboration/discussions::DiscussionMetricEvents` (event; events `DiscussionCreated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
    - `engagement/stars::StarMetricEvents` (event; events `RepositoryStarred@1`, `RepositoryUnstarred@1`)
    - `engagement/subscriptions::SubscriptionMetricEvents` (event; events `RepositorySubscriptionChanged@1`, `ConversationSubscriptionChanged@1`)
    - `integrations/webhooks::WebhookHealthEvents` (event; events `WebhookDeliverySucceeded@1`, `WebhookDeliveryFailed@1`, `WebhookRedelivered@1`)
    - `repositories/repository-access::EffectiveReadPermission` (synchronous)
- Explicit exclusions
  - `GitActivityMetric`
  - `ContributorCodeMetric`
  - `SourceAggregate`
  - `RepositoryTrafficMetric`

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryInsight`
- `EngagementMetric`
- `IntegrationHealthMetric`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryInsight`, `EngagementMetric`, `IntegrationHealthMetric`.
It excludes `GitActivityMetric`, `ContributorCodeMetric`, `SourceAggregate`, `RepositoryTrafficMetric`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryInsightEvents` (event; events `RepositoryCreated@1`, `RepositoryVisibilityChanged@1`, `RepositoryArchived@1`, `RepositoryUnarchived@1`)
- `collaboration/issues::IssueMetricEvents` (event; events `IssueCreated@1`, `IssueClosed@1`, `IssueReopened@1`)
- `collaboration/discussions::DiscussionMetricEvents` (event; events `DiscussionCreated@1`, `DiscussionClosed@1`, `DiscussionReopened@1`)
- `engagement/stars::StarMetricEvents` (event; events `RepositoryStarred@1`, `RepositoryUnstarred@1`)
- `engagement/subscriptions::SubscriptionMetricEvents` (event; events `RepositorySubscriptionChanged@1`, `ConversationSubscriptionChanged@1`)
- `integrations/webhooks::WebhookHealthEvents` (event; events `WebhookDeliverySucceeded@1`, `WebhookDeliveryFailed@1`, `WebhookRedelivered@1`)
- `repositories/repository-access::EffectiveReadPermission` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- None. Read-model context consumes versioned events and does not publish product facts.

## Official sources

- `projections-repository-insights-source-01`: [repository engagement insights, repository graph availability](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/about-repository-graphs) (verified 2026-07-22)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
