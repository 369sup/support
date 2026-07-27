# Organization Policies Bounded Context

- **Catalog path:** `organizations/organization-policies`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `active`
- **Semantic status:** `validated`

## Purpose

Owner-level policy constraints for repository and application-access behavior in organizations.

## Context content tree

- `organizations/organization-policies` [active]
  - Purpose: Repository and app-access policy constraints for organizations.
  - Capabilities
    - `resolve-app-access-decision` [active]
    - `get-organization-base-repository-permission` [active]
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
    - `BaseRepositoryPermission` is an active read contribution; its mutation
      lifecycle remains planned.
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

### `get-organization-base-repository-permission` [active]

- **Type:** `query`
- **Application boundary:** `GetOrganizationBaseRepositoryPermissionUseCase.getOrganizationBaseRepositoryPermission()`
- **Public entrypoint:** `server-api.ts#getOrganizationBaseRepositoryPermission`
- **Input:** Organization ID.
- **Success result:** `found` with the configured repository permission or `null` when the organization grants no base permission.
- **Expected rejections:** `none`
- **Authorization:** Trusted server consumers provide an organization ID after their own resource-scope authorization; this query does not disclose member or repository data.
- **Transaction:** Read-only policy lookup.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `organizations-organization-policies-source-02`
- **Local policy:** Development organizations default to read; absent policy contributes no repository permission.

### `resolve-app-access-decision` [active]

- **Type:** `query`
- **Application boundary:** `ResolveAppAccessDecisionUseCase.resolveAppAccessDecision()`
- **Public entrypoint:** `server-api.ts#resolveAppAccessDecision`
- **Input:** `AppAccessRequest` (OAuth authorization or GitHub App installation request context)
- **Success result:** `AppAccessPolicyDecision`
- **Expected rejections:** `outside-collaborator-blocked`, `scope-restricted`, `owner-approval-required`
- **Authorization:** This context owns organization-level app-access policy decisions.
- **Transaction:** Read-only policy lookup.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none` (active policy lifecycle deferred)
- **Official evidence:** `organizations-organization-policies-source-01`
- **Local policy:** Missing policies default to permissive decisions; outside collaborators are blocked when policy disallows them.

## Ubiquitous language

- **OAuth policy constraints**: organization-owned restriction on OAuth authorization semantics.
- **GitHub App installation policy**: organization-owned rule set for app installation behavior.
- **App access request**: normalized input for deciding whether app flows are allowed for a given actor.

## Ownership and invariants

This context owns repository/application policy concepts for organizations and their organization-level constraints.
It excludes `EnterprisePolicy`, `RepositoryGrant`, and `CodeRuleset`.

## Public capabilities

`resolveAppAccessDecision` and `getOrganizationBaseRepositoryPermission` are
exposed through `server-api.ts`. The base permission is a framework-free
integration contract consumed by repository permission resolution and
enterprise-team organization assignment.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `organizations/organizations::OrganizationReference` (synchronous)
- `enterprises/enterprise-policies::EnterprisePolicyConstraints` (synchronous)

## Authorization

Outside-collaborator and sensitive-permission gates are evaluated as policy decisions. Policy owner and governance are decided by organization owner/admin roles in the repository-map contract; owner-specific mutation flows are not yet activated.

## Persistence and transactions

Persistent policy state is not implemented in this phase. In-memory adapters
store development base-permission facts and app-access policies; absent base
permission contributes no repository access.

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
- `organizations-organization-policies-source-02`: [organization base repository permission](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) (verified 2026-07-27)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
