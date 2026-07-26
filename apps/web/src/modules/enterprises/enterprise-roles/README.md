# Enterprise Roles

## Purpose

Own predefined/custom enterprise roles, assignments, permissions, and
administration decisions.

## Context content tree

- Administration authorization [active]
  - `authorize-enterprise-administration`
  - Owned: `EnterpriseRoleDefinition`, `EnterpriseRoleAssignment`,
    `EnterprisePermission`
  - Active affiliation and `view-enterprise` permission are both required.
- Planned events
  - `EnterpriseRoleDefined@1`, `EnterpriseRoleUpdated@1`,
    `EnterpriseRoleDeleted@1`, `EnterpriseRoleAssigned@1`,
    `EnterpriseRoleRevoked@1`
- External relationships
  - `enterprises/enterprises::EnterpriseReference`
  - `enterprises/enterprise-memberships::EnterpriseAffiliation`
  - planned `enterprises/enterprise-teams::EnterpriseTeamReference`
- Excludes
  - `OrganizationRole`, `RepositoryRole`, `BillingAccount`

## Designed use cases

### `authorize-enterprise-administration` [active]

- **Type:** `query`
- **Application boundary:** `AuthorizeEnterpriseAdministrationUseCase.authorizeEnterpriseAdministration()`
- **Public entrypoint:** `server-api.ts#authorizeEnterpriseAdministration`
- **Input:** Account ID and enterprise ID.
- **Success result:** `allowed` with predefined role and `view-enterprise`.
- **Expected rejections:** `membership-inactive`, `permission-missing`
- **Authorization:** This context owns the enterprise permission decision.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `enterprises/enterprises::EnterpriseReference`, `enterprises/enterprise-memberships::EnterpriseAffiliation`
- **Published events:** `none`
- **Official evidence:** `enterprises-enterprise-roles-source-01`
- **Local policy:** Ordinary enterprise membership never implies administration.

## Ubiquitous language

- **Enterprise administration decision**: source role and permission result for
  one account and enterprise.

## Ownership and invariants

Role assignment is the only source of enterprise administration permissions in
the active slice.

## Public capabilities

`authorizeEnterpriseAdministration` is exposed through `server-api.ts`.

## Dependencies and consistency

Active affiliation is read synchronously from enterprise memberships before
role assignments are evaluated.

## Authorization

Denials distinguish inactive affiliation from missing permission. Neither
grants repository access.

## Persistence and transactions

Role assignments are deterministic in-memory fixtures.

## Data classification

Role assignment is security-sensitive authorization data.

## Retention and erasure

Fixtures live for the process lifetime.

## Events and failure behavior

The active query emits no events; catalog role events remain planned.

## Official sources

- `enterprises-enterprise-roles-source-01`: <https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles>

## Exceptions

Only predefined fixture assignments are active; custom-role management remains
planned.
