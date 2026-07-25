# Organization Policies Bounded Context

- **Catalog path:** `organizations/organization-policies`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `candidate`

## Purpose

Owner-level policy constraints for repository and application-access behavior in organizations.

## Context content tree

- `organizations/organization-policies` [planned]
  - Purpose: Repository and app-access policy constraints for organizations.
  - Capabilities
    - `resolve-app-access-decision` [planned]
    - `repository-permission-contribution` [planned]
  - Owned domain concepts
    - `BaseRepositoryPermission`
    - `RepositoryCreationPolicy`
    - `RepositoryVisibilityPolicy`
    - `OutsideCollaboratorPolicy`
    - `OAuthPolicyConstraints`
    - `OAuthAppAccessRestriction`
    - `GitHubAppInstallationPolicy`
    - `AppAccessRequestPolicy`
    - `ProjectPolicy`
    - `DiscussionPolicy`
  - Business rules and invariants
    - `OAuthPolicyConstraints` defines whether organization outside collaborators are allowed and optional scope allow-lists for OAuth App authorization.
    - `GitHubAppInstallationPolicy` controls outside-collaborator installation and whether extra requested permissions require owner approval.
    - `BaseRepositoryPermission` and repository-policy concepts remain planned and are modeled as read-model facts until lifecycle contexts are activated.
  - Published events
    - `OrganizationPolicyChanged@1` [planned]: organization policy changed.
    - `BaseRepositoryPermissionChanged@1` [planned]: base repository permission changed.
    - `OAuthPolicyConstraintsChanged@1` [planned]: OAuth policy changed.
    - `GitHubAppInstallationPolicyChanged@1` [planned]: GitHub App installation policy changed.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `enterprises/enterprise-policies::EnterprisePolicyConstraints` (synchronous)

## Designed use cases

### `resolve-app-access-decision` [planned]

- **Type:** `query`
- **Application boundary:** `ResolveAppAccessDecisionUseCase.resolveAppAccessDecision()`
- **Input:** `AppAccessRequest` (OAuth authorization or GitHub App installation request context)
- **Success result:** `AppAccessPolicyDecision`
- **Rejections:** `outside-collaborator-blocked`, `scope-restricted`, `owner-approval-required`
- **Published events:** `none` (active policy lifecycle deferred)

## Ubiquitous language

- **OAuth policy constraints**: organization-owned restriction on OAuth authorization semantics.
- **GitHub App installation policy**: organization-owned rule set for app installation behavior.
- **App access request**: normalized input for deciding whether app flows are allowed for a given actor.

## Ownership and invariants

This context owns repository/application policy concepts for organizations and their organization-level constraints.
It excludes `EnterprisePolicy`, `RepositoryGrant`, and `CodeRuleset`.

## Public capabilities

No active public capability while planned. Activation requires an approved use case and runtime consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `enterprises/enterprise-policies::EnterprisePolicyConstraints` (synchronous)

## Authorization

Outside-collaborator and sensitive-permission gates are evaluated as policy decisions. Policy owner and governance are decided by organization owner/admin roles in the repository-map contract; owner-specific mutation flows are not yet activated.

## Persistence and transactions

Persistent policy state is not implemented while planned. In-memory adapters are used in policy-seed tests.

## Data classification

Policy records are organization-scoped and non-personal.

## Retention and erasure

Retention and erasure behavior are deferred to policy command activation.

## Events and failure behavior

- `OrganizationPolicyChanged@1` (domain, planned): organization policy changed. contract and ordering pending activation.
- `BaseRepositoryPermissionChanged@1` (domain, planned): base repository permission changed. contract and ordering pending activation.
- `OAuthPolicyConstraintsChanged@1` (domain, planned): OAuth constraints changed. contract and ordering pending activation.
- `GitHubAppInstallationPolicyChanged@1` (domain, planned): GitHub App installation policy changed. contract and ordering pending activation.

## Official sources

- `organizations-organization-policies-source-01`: [organization settings, member privileges, repository policies](https://docs.github.com/en/organizations/managing-organization-settings) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.