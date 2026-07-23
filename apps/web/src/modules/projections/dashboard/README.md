# Dashboard Projection

## Purpose

Own available and selected personal/organization Dashboard context plus a
permission-filtered repository view. Enterprise administration is separate.

## Context content tree

- Dashboard context coordination [active]
  - `list-available-dashboard-contexts`
  - `get-selected-dashboard-context`
  - `select-dashboard-context`
  - `restore-last-valid-dashboard-context`
  - Owned: `AvailableDashboardContext`, `SelectedDashboardContext`
  - Selection is keyed by authentication session ID.
- Dashboard repository projection [active]
  - `get-dashboard-repository-view`
  - Owned: `DashboardRepositoryView`
  - Context scopes owner candidates; repository access filters disclosure.
- External relationships
  - `identity/accounts::AccountReference`
  - `identity/authentication::AuthenticatedSessionReference`
  - `organizations/organizations::OrganizationReference`
  - `organizations/organization-memberships::OrganizationMembershipReference`
  - `repositories/repositories::RepositoryCandidateReference`
  - `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- Excludes
  - `AuthenticationSession`, `OrganizationMembership`, `RepositoryGrant`,
    `EnterpriseDashboardContext`
- Published events: none; this is a read-model projection.

## Designed use cases

### `get-dashboard-repository-view` [active]

- **Type:** `query`
- **Application boundary:** `GetDashboardRepositoryViewUseCase.getDashboardRepositoryView()`
- **Public entrypoint:** `server-api.ts#getDashboardRepositoryView`
- **Input:** Authenticated session reference.
- **Success result:** Selected context and permission-filtered repository views.
- **Expected rejections:** `none`
- **Authorization:** `repositories/repository-access` owns each repository decision.
- **Transaction:** Read-only cross-context projection plus context fallback persistence.
- **Idempotency:** Query; fallback write is deterministic.
- **Dependencies:** `identity/authentication::AuthenticatedSessionReference`, `repositories/repositories::RepositoryCandidateReference`, `repositories/repository-access::EffectiveRepositoryPermissionDecision`
- **Published events:** `none`
- **Official evidence:** `projections-dashboard-source-01`
- **Local policy:** Context never grants repository permission.

### `get-selected-dashboard-context` [active]

- **Type:** `query`
- **Application boundary:** `GetSelectedDashboardContextUseCase.getSelectedDashboardContext()`
- **Public entrypoint:** `server-api.ts#getSelectedDashboardContext`
- **Input:** Authentication session ID.
- **Success result:** `found` with selected context.
- **Expected rejections:** `context-not-selected`
- **Authorization:** Session ID scopes the selection.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/authentication::AuthenticatedSessionReference`
- **Published events:** `none`
- **Official evidence:** `projections-dashboard-source-02`
- **Local policy:** Callers normally restore before presentation.

### `list-available-dashboard-contexts` [active]

- **Type:** `query`
- **Application boundary:** `ListAvailableDashboardContextsUseCase.listAvailableDashboardContexts()`
- **Public entrypoint:** `server-api.ts#listAvailableDashboardContexts`
- **Input:** Authenticated session reference.
- **Success result:** Personal context and active organization contexts.
- **Expected rejections:** `none`
- **Authorization:** Membership is recomputed for the authenticated account.
- **Transaction:** Read-only.
- **Idempotency:** Query.
- **Dependencies:** `identity/accounts::AccountReference`, `organizations/organizations::OrganizationReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `projections-dashboard-source-02`
- **Local policy:** Enterprise never appears in this list.

### `restore-last-valid-dashboard-context` [active]

- **Type:** `command`
- **Application boundary:** `RestoreLastValidDashboardContextUseCase.restoreLastValidDashboardContext()`
- **Public entrypoint:** `server-api.ts#restoreLastValidDashboardContext`
- **Input:** Authenticated session reference.
- **Success result:** `restored` or `fallback-selected` with valid context.
- **Expected rejections:** `none`
- **Authorization:** Revalidates account ownership, membership, and organization lifecycle.
- **Transaction:** One session-selection replacement.
- **Idempotency:** Repeated restore persists the same valid result.
- **Dependencies:** `identity/authentication::AuthenticatedSessionReference`, `organizations/organizations::OrganizationReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `projections-dashboard-source-02`
- **Local policy:** Invalid selection falls back and persists personal context.

### `select-dashboard-context` [active]

- **Type:** `command`
- **Application boundary:** `SelectDashboardContextUseCase.selectDashboardContext()`
- **Public entrypoint:** `server-api.ts#selectDashboardContext`
- **Input:** Authenticated session and personal/organization target.
- **Success result:** `selected` with authoritative context.
- **Expected rejections:** `context-not-available`, `cross-account-context`
- **Authorization:** Personal ID must be self; organization requires active membership.
- **Transaction:** One session-selection replacement.
- **Idempotency:** Re-selecting the same valid context is safe.
- **Dependencies:** `identity/accounts::AccountReference`, `identity/authentication::AuthenticatedSessionReference`, `organizations/organizations::OrganizationReference`, `organizations/organization-memberships::OrganizationMembershipReference`
- **Published events:** `none`
- **Official evidence:** `projections-dashboard-source-02`
- **Local policy:** Client IDs are always revalidated.

## Ubiquitous language

- **Dashboard context**: personal or organization owner scope for navigation and
  projection, not an authorization grant.
- **Fallback**: persisted personal context chosen when a stored selection is
  invalid for the current session.

## Ownership and invariants

This projection owns only context selection and read views. It never owns
sessions, memberships, organizations, repositories, or grants.

## Public capabilities

The five active operations are exposed through `server-api.ts`.

## Dependencies and consistency

Cross-context reads use declared public contracts. One session selection is
written locally after account switching or explicit selection; no distributed
transaction is attempted.

## Authorization

Membership authorizes organization context eligibility only. Repository
visibility is independently decided by repository access.

## Persistence and transactions

A versioned process-local Map stores one selected context per session ID.

## Data classification

Selected context is account-associated preference data; repository views may
contain private/internal metadata only after access allows disclosure.

## Retention and erasure

Selections live for the process lifetime and become unreachable when their
session set is removed.

## Events and failure behavior

The projection publishes no product facts. Invalid client selections use named
results; dependency failures propagate.

## Official sources

- `projections-dashboard-source-01`: <https://docs.github.com/en/account-and-profile/concepts/personal-dashboard>
- `projections-dashboard-source-02`: <https://docs.github.com/en/enterprise-cloud@latest/organizations/collaborating-with-groups-in-organizations/about-your-organization-dashboard>

## Exceptions

None.
