# Audit Logs Bounded Context

- **Catalog path:** `governance/audit-logs`
- **Kind:** `domain`
- **Classification:** `supporting`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Organization and enterprise audit events, scopes, actors, targets, search, export, streaming, and retention policy.

## Context content tree

- `governance/audit-logs` [planned]
  - Purpose: Organization and enterprise audit events, scopes, actors, targets, search, export, streaming, and retention policy.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `AuditEvent`
    - `AuditScope`
    - `AuditActor`
    - `AuditTarget`
    - `AuditExport`
    - `AuditRetentionPolicy`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `AuditEventRecorded@1` [planned]: audit event recorded.
    - `AuditExportRequested@1` [planned]: audit export requested.
    - `AuditExportCompleted@1` [planned]: audit export completed.
    - `AuditExportFailed@1` [planned]: audit export failed.
    - `AuditRetentionPolicyChanged@1` [planned]: audit retention policy changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationAuditScope` (synchronous)
    - `enterprises/enterprises::EnterpriseAuditScope` (synchronous)
    - `platform/audit-storage::AuditStoragePort` (synchronous)
    - `identity/accounts::PublishedEventContract` (event; events `AccountDeleted@1`)
    - `enterprises/enterprise-memberships::PublishedEventContract` (event; events `EnterpriseMemberAdded@1`, `EnterpriseMemberRemoved@1`, `EnterpriseAffiliationChanged@1`)
    - `enterprises/enterprise-roles::PublishedEventContract` (event; events `EnterpriseRoleDefined@1`, `EnterpriseRoleUpdated@1`, `EnterpriseRoleDeleted@1`, `EnterpriseRoleAssigned@1`, `EnterpriseRoleRevoked@1`)
    - `enterprises/enterprise-iam::PublishedEventContract` (event; events `IdentityProviderConfigured@1`, `ProvisionedIdentityCreated@1`, `ProvisionedIdentitySuspended@1`, `ProvisionedIdentityReinstated@1`, `ProvisionedIdentityDeprovisioned@1`)
    - `enterprises/enterprise-policies::PublishedEventContract` (event; events `EnterprisePolicyChanged@1`, `EnterprisePolicyEnforcementChanged@1`, `OrganizationPolicyOverrideChanged@1`)
    - `organizations/organization-memberships::PublishedEventContract` (event; events `OrganizationMemberAdded@1`, `OrganizationMemberRemoved@1`, `OrganizationMemberRoleChanged@1`)
    - `organizations/organization-teams::PublishedEventContract` (event; events `OrganizationTeamCreated@1`, `OrganizationTeamUpdated@1`, `OrganizationTeamDeleted@1`, `TeamMemberAdded@1`, `TeamMemberRemoved@1`, `TeamMaintainerChanged@1`)
    - `organizations/organization-roles::PublishedEventContract` (event; events `OrganizationRoleDefined@1`, `OrganizationRoleUpdated@1`, `OrganizationRoleDeleted@1`, `OrganizationRoleAssigned@1`, `OrganizationRoleRevoked@1`, `CustomRepositoryRoleDefined@1`, `CustomRepositoryRoleUpdated@1`, `CustomRepositoryRoleDeleted@1`)
    - `organizations/organization-policies::PublishedEventContract` (event; events `OrganizationPolicyChanged@1`, `BaseRepositoryPermissionChanged@1`)
    - `enterprises/custom-properties::PublishedEventContract` (event; events `EnterpriseRepositoryPropertyDefined@1`, `EnterpriseRepositoryPropertyUpdated@1`, `EnterpriseRepositoryPropertyDeleted@1`, `EnterpriseRepositoryPropertyPromoted@1`, `EnterpriseOrganizationPropertyDefined@1`, `EnterpriseOrganizationPropertyUpdated@1`, `EnterpriseOrganizationPropertyDeleted@1`, `OrganizationPropertyValueSet@1`, `OrganizationPropertyValueCleared@1`)
    - `organizations/custom-properties::PublishedEventContract` (event; events `OrganizationRepositoryPropertyDefined@1`, `OrganizationRepositoryPropertyUpdated@1`, `OrganizationRepositoryPropertyDeleted@1`, `OrganizationRepositoryPropertyPromotionRequested@1`, `RepositoryPropertyValueSet@1`, `RepositoryPropertyValueCleared@1`)
    - `repositories/repositories::PublishedEventContract` (event; events `RepositoryVisibilityChanged@1`, `RepositoryTransferred@1`, `RepositoryArchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
    - `repositories/repository-access::PublishedEventContract` (event; events `RepositoryAccessGranted@1`, `RepositoryAccessChanged@1`, `RepositoryAccessRevoked@1`, `OutsideCollaboratorAccessGranted@1`, `OutsideCollaboratorAccessRevoked@1`)
    - `integrations/github-app-registrations::PublishedEventContract` (event; events `GitHubAppRegistered@1`, `GitHubAppUpdated@1`, `GitHubAppDeleted@1`, `GitHubAppPermissionsChanged@1`, `GitHubAppOwnershipTransferred@1`)
    - `integrations/github-app-installations::PublishedEventContract` (event; events `GitHubAppInstalled@1`, `GitHubAppInstallationSuspended@1`, `GitHubAppInstallationUnsuspended@1`, `GitHubAppUninstalled@1`, `GitHubAppInstallationPermissionsChanged@1`)
    - `integrations/oauth-app-registrations::OAuthClientAuditEvents` (event; events `OAuthClientRegistered@1`, `OAuthClientUpdated@1`, `OAuthClientDeleted@1`)
    - `integrations/oauth-authorizations::PublishedEventContract` (event; events `OAuthAuthorizationGranted@1`, `OAuthAuthorizationRevoked@1`, `OAuthScopesChanged@1`)
    - `integrations/webhooks::PublishedEventContract` (event; events `WebhookCreated@1`, `WebhookUpdated@1`, `WebhookDeleted@1`, `WebhookDeliveryFailed@1`, `WebhookRedelivered@1`)
    - `commerce/billing::PublishedEventContract` (event; events `BillingAccountUpdated@1`, `PaymentProfileUpdated@1`, `BudgetCreated@1`, `BudgetUpdated@1`, `BudgetExceeded@1`, `CostCenterCreated@1`, `CostCenterUpdated@1`, `CostCenterDeleted@1`)
    - `commerce/entitlements::PublishedEventContract` (event; events `PlanChanged@1`, `EntitlementGranted@1`, `EntitlementRevoked@1`, `LicenseAssigned@1`, `LicenseRevoked@1`, `UsageLimitReached@1`)
- Explicit exclusions
  - `ProductActivityFeed`
  - `StorageRecord`
  - `ArbitraryApplicationLog`

## Ubiquitous language

The catalog reserves these terms for this context:

- `AuditEvent`
- `AuditScope`
- `AuditActor`
- `AuditTarget`
- `AuditExport`
- `AuditRetentionPolicy`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `AuditEvent`, `AuditScope`, `AuditActor`, `AuditTarget`, `AuditExport`, `AuditRetentionPolicy`.
It excludes `ProductActivityFeed`, `StorageRecord`, `ArbitraryApplicationLog`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationAuditScope` (synchronous)
- `enterprises/enterprises::EnterpriseAuditScope` (synchronous)
- `platform/audit-storage::AuditStoragePort` (synchronous)
- `identity/accounts::PublishedEventContract` (event; events `AccountDeleted@1`)
- `enterprises/enterprise-memberships::PublishedEventContract` (event; events `EnterpriseMemberAdded@1`, `EnterpriseMemberRemoved@1`, `EnterpriseAffiliationChanged@1`)
- `enterprises/enterprise-roles::PublishedEventContract` (event; events `EnterpriseRoleDefined@1`, `EnterpriseRoleUpdated@1`, `EnterpriseRoleDeleted@1`, `EnterpriseRoleAssigned@1`, `EnterpriseRoleRevoked@1`)
- `enterprises/enterprise-iam::PublishedEventContract` (event; events `IdentityProviderConfigured@1`, `ProvisionedIdentityCreated@1`, `ProvisionedIdentitySuspended@1`, `ProvisionedIdentityReinstated@1`, `ProvisionedIdentityDeprovisioned@1`)
- `enterprises/enterprise-policies::PublishedEventContract` (event; events `EnterprisePolicyChanged@1`, `EnterprisePolicyEnforcementChanged@1`, `OrganizationPolicyOverrideChanged@1`)
- `organizations/organization-memberships::PublishedEventContract` (event; events `OrganizationMemberAdded@1`, `OrganizationMemberRemoved@1`, `OrganizationMemberRoleChanged@1`)
- `organizations/organization-teams::PublishedEventContract` (event; events `OrganizationTeamCreated@1`, `OrganizationTeamUpdated@1`, `OrganizationTeamDeleted@1`, `TeamMemberAdded@1`, `TeamMemberRemoved@1`, `TeamMaintainerChanged@1`)
- `organizations/organization-roles::PublishedEventContract` (event; events `OrganizationRoleDefined@1`, `OrganizationRoleUpdated@1`, `OrganizationRoleDeleted@1`, `OrganizationRoleAssigned@1`, `OrganizationRoleRevoked@1`, `CustomRepositoryRoleDefined@1`, `CustomRepositoryRoleUpdated@1`, `CustomRepositoryRoleDeleted@1`)
- `organizations/organization-policies::PublishedEventContract` (event; events `OrganizationPolicyChanged@1`, `BaseRepositoryPermissionChanged@1`)
- `enterprises/custom-properties::PublishedEventContract` (event; events `EnterpriseRepositoryPropertyDefined@1`, `EnterpriseRepositoryPropertyUpdated@1`, `EnterpriseRepositoryPropertyDeleted@1`, `EnterpriseRepositoryPropertyPromoted@1`, `EnterpriseOrganizationPropertyDefined@1`, `EnterpriseOrganizationPropertyUpdated@1`, `EnterpriseOrganizationPropertyDeleted@1`, `OrganizationPropertyValueSet@1`, `OrganizationPropertyValueCleared@1`)
- `organizations/custom-properties::PublishedEventContract` (event; events `OrganizationRepositoryPropertyDefined@1`, `OrganizationRepositoryPropertyUpdated@1`, `OrganizationRepositoryPropertyDeleted@1`, `OrganizationRepositoryPropertyPromotionRequested@1`, `RepositoryPropertyValueSet@1`, `RepositoryPropertyValueCleared@1`)
- `repositories/repositories::PublishedEventContract` (event; events `RepositoryVisibilityChanged@1`, `RepositoryTransferred@1`, `RepositoryArchived@1`, `RepositoryDeleted@1`, `RepositoryRestored@1`)
- `repositories/repository-access::PublishedEventContract` (event; events `RepositoryAccessGranted@1`, `RepositoryAccessChanged@1`, `RepositoryAccessRevoked@1`, `OutsideCollaboratorAccessGranted@1`, `OutsideCollaboratorAccessRevoked@1`)
- `integrations/github-app-registrations::PublishedEventContract` (event; events `GitHubAppRegistered@1`, `GitHubAppUpdated@1`, `GitHubAppDeleted@1`, `GitHubAppPermissionsChanged@1`, `GitHubAppOwnershipTransferred@1`)
- `integrations/github-app-installations::PublishedEventContract` (event; events `GitHubAppInstalled@1`, `GitHubAppInstallationSuspended@1`, `GitHubAppInstallationUnsuspended@1`, `GitHubAppUninstalled@1`, `GitHubAppInstallationPermissionsChanged@1`)
- `integrations/oauth-app-registrations::OAuthClientAuditEvents` (event; events `OAuthClientRegistered@1`, `OAuthClientUpdated@1`, `OAuthClientDeleted@1`)
- `integrations/oauth-authorizations::PublishedEventContract` (event; events `OAuthAuthorizationGranted@1`, `OAuthAuthorizationRevoked@1`, `OAuthScopesChanged@1`)
- `integrations/webhooks::PublishedEventContract` (event; events `WebhookCreated@1`, `WebhookUpdated@1`, `WebhookDeleted@1`, `WebhookDeliveryFailed@1`, `WebhookRedelivered@1`)
- `commerce/billing::PublishedEventContract` (event; events `BillingAccountUpdated@1`, `PaymentProfileUpdated@1`, `BudgetCreated@1`, `BudgetUpdated@1`, `BudgetExceeded@1`, `CostCenterCreated@1`, `CostCenterUpdated@1`, `CostCenterDeleted@1`)
- `commerce/entitlements::PublishedEventContract` (event; events `PlanChanged@1`, `EntitlementGranted@1`, `EntitlementRevoked@1`, `LicenseAssigned@1`, `LicenseRevoked@1`, `UsageLimitReached@1`)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `AuditEventRecorded@1` (domain, planned): audit event recorded. contract and ordering pending activation.
- `AuditExportRequested@1` (domain, planned): audit export requested. contract and ordering pending activation.
- `AuditExportCompleted@1` (domain, planned): audit export completed. contract and ordering pending activation.
- `AuditExportFailed@1` (domain, planned): audit export failed. contract and ordering pending activation.
- `AuditRetentionPolicyChanged@1` (domain, planned): audit retention policy changed. contract and ordering pending activation.

## Official sources

- `governance-audit-logs-source-01`: [enterprise audit log, audit search, audit export, audit streaming](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise) (not yet verified)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
