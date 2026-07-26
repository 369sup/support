# Enterprise Iam Bounded Context

- **Catalog path:** `enterprises/enterprise-iam`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Enterprise identity-provider configuration, SAML or OIDC authentication, SCIM provisioning, and group synchronization.

## Context content tree

- `enterprises/enterprise-iam` [planned]
  - Purpose: Enterprise identity-provider configuration, SAML or OIDC authentication, SCIM provisioning, and group synchronization.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `IdentityProviderConfiguration`
    - `ProvisionedIdentity`
    - `ExternalGroupBinding`
    - `SetupUserConfiguration`
  - Business rules and invariants
    - Pending official-source validation before activation.
  - Published events
    - `IdentityProviderConfigured@1` [planned]: identity provider configured.
    - `ProvisionedIdentityCreated@1` [planned]: provisioned identity created.
    - `ProvisionedIdentitySuspended@1` [planned]: provisioned identity suspended.
    - `ProvisionedIdentityReinstated@1` [planned]: provisioned identity reinstated.
    - `ProvisionedIdentityDeprovisioned@1` [planned]: provisioned identity deprovisioned.
    - `ExternalGroupLinked@1` [planned]: external group linked.
    - `ExternalGroupUnlinked@1` [planned]: external group unlinked.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `enterprises/enterprises::EnterpriseReference` (synchronous)
    - `identity/accounts::ManagedAccountProvisioning` (synchronous)
    - `identity/authentication::ExternalAuthenticationBinding` (synchronous)
    - `enterprises/enterprise-memberships::EnterpriseMembershipProvisioning` (synchronous)
- Explicit exclusions
  - `InteractiveSession`
  - `AccountProfile`
  - `OrganizationRole`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ownership and invariants

This context owns `IdentityProviderConfiguration`, `ProvisionedIdentity`, `ExternalGroupBinding`, `SetupUserConfiguration`.
It excludes `InteractiveSession`, `AccountProfile`, `OrganizationRole`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `identity/accounts::ManagedAccountProvisioning` (synchronous)
- `identity/authentication::ExternalAuthenticationBinding` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseMembershipProvisioning` (synchronous)

## Official sources

- `enterprises-enterprise-iam-source-01`: [enterprise IAM, SAML, OIDC, SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
