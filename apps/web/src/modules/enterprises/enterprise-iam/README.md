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

## Ubiquitous language

The catalog reserves these terms for this context:

- `IdentityProviderConfiguration`
- `ProvisionedIdentity`
- `ExternalGroupBinding`
- `SetupUserConfiguration`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `IdentityProviderConfiguration`, `ProvisionedIdentity`, `ExternalGroupBinding`, `SetupUserConfiguration`.
It excludes `InteractiveSession`, `AccountProfile`, `OrganizationRole`.

No semantic claim is validated yet. Do not infer business invariants until the official sources are verified.

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `enterprises/enterprises::EnterpriseReference` (synchronous)
- `identity/accounts::ManagedAccountProvisioning` (synchronous)
- `identity/authentication::ExternalAuthenticationBinding` (synchronous)
- `enterprises/enterprise-memberships::EnterpriseMembershipProvisioning` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `IdentityProviderConfigured@1` (domain, planned): identity provider configured. contract and ordering pending activation.
- `ProvisionedIdentityCreated@1` (domain, planned): provisioned identity created. contract and ordering pending activation.
- `ProvisionedIdentitySuspended@1` (domain, planned): provisioned identity suspended. contract and ordering pending activation.
- `ProvisionedIdentityReinstated@1` (domain, planned): provisioned identity reinstated. contract and ordering pending activation.
- `ProvisionedIdentityDeprovisioned@1` (domain, planned): provisioned identity deprovisioned. contract and ordering pending activation.
- `ExternalGroupLinked@1` (domain, planned): external group linked. contract and ordering pending activation.
- `ExternalGroupUnlinked@1` (domain, planned): external group unlinked. contract and ordering pending activation.

## Official sources

- `enterprises-enterprise-iam-source-01`: [enterprise IAM, SAML, OIDC, SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
