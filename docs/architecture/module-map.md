<!-- Generated from module-map.json. Do not edit directly. -->
# Module Map

Reproduce GitHub product semantics for people, enterprises, organizations, teams, repositories, collaboration, engagement, governance, commerce, and integrations without implementing source-code or Git capabilities.

## Product boundary

### Excluded capabilities

| Capability | Reason |
| --- | --- |
| git-and-repository-content | Git objects, files, commits, refs, branches, tags, clone, fetch, push, and repository content are outside the product boundary. |
| diff-merge-and-pull-requests | Diffs, mergeability, merge execution, pull requests, reviews, and code-review state require the excluded code domain. |
| actions-and-code-products | Actions execution, code search and navigation, code security analysis, Dependabot, Packages, Pages, and Codespaces are excluded. |

### Deferred capabilities

| Capability | Activation prerequisite |
| --- | --- |
| releases | A trustworthy tag-reference provider. |
| forks-and-templates | Git history and repository-content provisioning providers. |
| community-profile | A repository-content provider for community files. |
| code-rulesets | Branch, tag, push, and code-governance resources. |
| repository-traffic-metrics | A trustworthy product-telemetry ingestion, retention, and aggregation capability. |
| repository-wiki-content | A trustworthy Git-backed wiki content provider. |
| repository-migration-locks | A repository migration orchestration capability with documented lock ownership and recovery. |
| organization-discussion-source-repository-disruption | Documented GitHub behavior or an accepted product policy for source repository transfer and deletion. |

## Bounded contexts

| Subdomain | Bounded context | Kind | Classification | Maturity | Implementation | Source freshness | Semantic status | Responsibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| identity | [accounts](../../apps/web/src/modules/identity/accounts/README.md) | domain | core | stable | active | fresh | validated | User account identity, personal or managed account type, human or machine usage, username, lifecycle, and ghost attribution. |
| identity | [authentication](../../apps/web/src/modules/identity/authentication/README.md) | domain | core | stable | active | fresh | validated | Credentials, browser session sets, active account-session selection, two-factor authentication, recovery, and external login binding. |
| identity | [profiles](../../apps/web/src/modules/identity/profiles/README.md) | domain | supporting | stable | planned | unverified | candidate | Public and private personal profiles, profile status, and pinned-item presentation. |
| identity | [social-graph](../../apps/web/src/modules/identity/social-graph/README.md) | domain | supporting | stable | planned | unverified | candidate | Following relationships between users and organizations. |
| enterprises | [enterprises](../../apps/web/src/modules/enterprises/enterprises/README.md) | domain | core | stable | active | fresh | validated | Enterprise identity, profile, account mode, lifecycle, and authoritative organization ownership links. |
| enterprises | [enterprise-memberships](../../apps/web/src/modules/enterprises/enterprise-memberships/README.md) | domain | core | stable | active | fresh | validated | Enterprise membership, invitations, affiliation, guest collaborators, and unaffiliated users. |
| enterprises | [enterprise-teams](../../apps/web/src/modules/enterprises/enterprise-teams/README.md) | domain | supporting | preview | planned | unverified | candidate | Enterprise-wide teams used for centralized role, organization, and license assignment. |
| enterprises | [enterprise-roles](../../apps/web/src/modules/enterprises/enterprise-roles/README.md) | domain | core | stable | active | fresh | validated | Predefined and custom enterprise roles, permissions, and assignments. |
| enterprises | [enterprise-iam](../../apps/web/src/modules/enterprises/enterprise-iam/README.md) | domain | core | stable | planned | unverified | candidate | Enterprise identity-provider configuration, SAML or OIDC authentication, SCIM provisioning, and group synchronization. |
| enterprises | [enterprise-policies](../../apps/web/src/modules/enterprises/enterprise-policies/README.md) | domain | core | stable | planned | unverified | candidate | Enterprise policy constraints applied across owned organizations and repositories. |
| enterprises | [custom-properties](../../apps/web/src/modules/enterprises/custom-properties/README.md) | domain | supporting | stable | planned | fresh | validated | Enterprise-defined repository and organization custom-property schemas, organization values, and promotion of organization repository properties. |
| organizations | [organizations](../../apps/web/src/modules/organizations/organizations/README.md) | domain | core | stable | active | fresh | validated | Organization identity, login, profile, lifecycle, and verified domains. |
| organizations | [organization-memberships](../../apps/web/src/modules/organizations/organization-memberships/README.md) | domain | core | stable | active | fresh | validated | Organization membership, invitations, member roles, and membership lifecycle. |
| organizations | [organization-teams](../../apps/web/src/modules/organizations/organization-teams/README.md) | domain | core | stable | planned | fresh | validated | Organization teams, nested hierarchy, visibility, membership, maintainers, and mentions. |
| organizations | [organization-roles](../../apps/web/src/modules/organizations/organization-roles/README.md) | domain | supporting | stable | planned | fresh | validated | Predefined and custom organization roles and custom repository-role definitions. |
| organizations | [organization-policies](../../apps/web/src/modules/organizations/organization-policies/README.md) | domain | core | stable | planned | unverified | candidate | Organization policies for repositories, collaborators, projects, discussions, and member privileges. |
| organizations | [custom-properties](../../apps/web/src/modules/organizations/custom-properties/README.md) | domain | supporting | stable | planned | fresh | validated | Organization-defined repository custom-property schemas and repository property values from organization or enterprise definitions. |
| repositories | [repositories](../../apps/web/src/modules/repositories/repositories/README.md) | domain | core | stable | active | fresh | validated | Repository identity, personal or organization ownership, name, description, homepage, visibility, lifecycle, redirects, and transfer. |
| repositories | [repository-access](../../apps/web/src/modules/repositories/repository-access/README.md) | domain | core | stable | active | fresh | validated | Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution. |
| repositories | [repository-features](../../apps/web/src/modules/repositories/repository-features/README.md) | domain | supporting | stable | planned | fresh | validated | Repository Issues, Discussions, Projects, and Wiki enablement with feature-specific configuration. |
| repositories | [repository-metadata](../../apps/web/src/modules/repositories/repository-metadata/README.md) | domain | supporting | stable | planned | fresh | validated | Repository topics and social-media preview configuration. |
| collaboration | [issues](../../apps/web/src/modules/collaboration/issues/README.md) | domain | core | stable | planned | fresh | candidate | Issue lifecycle, assignment, hierarchy, dependency, transfer, and work tracking. |
| collaboration | [issue-schema](../../apps/web/src/modules/collaboration/issue-schema/README.md) | domain | supporting | stable | planned | fresh | candidate | Organization-level issue type and field definitions, visibility, pinning, and type-field associations. |
| collaboration | [labels-and-milestones](../../apps/web/src/modules/collaboration/labels-and-milestones/README.md) | domain | supporting | stable | planned | unverified | candidate | Repository-scoped labels, milestones, and work classification. |
| collaboration | [conversations](../../apps/web/src/modules/collaboration/conversations/README.md) | domain | supporting | stable | planned | fresh | candidate | Capability-constrained comments, discussion replies, reactions, mentions, revisions, and locks for a closed set of subjects. |
| collaboration | [discussions](../../apps/web/src/modules/collaboration/discussions/README.md) | domain | core | stable | planned | fresh | validated | Repository discussion forums and organization discussion spaces, source-repository binding, categories, sections, polls, answers, pins, and lifecycle. |
| collaboration | [moderation](../../apps/web/src/modules/collaboration/moderation/README.md) | domain | supporting | stable | planned | unverified | candidate | Content reports, moderation cases, blocks, interaction limits, and visibility decisions. |
| collaboration | [projects](../../apps/web/src/modules/collaboration/projects/README.md) | domain | core | stable | planned | unverified | candidate | User- or organization-owned projects, items, draft issues, views, fields, workflows, charts, templates, and status updates. |
| engagement | [stars](../../apps/web/src/modules/engagement/stars/README.md) | domain | supporting | stable | planned | fresh | candidate | Repository starring and user-defined star lists for discovery and collection. |
| engagement | [subscriptions](../../apps/web/src/modules/engagement/subscriptions/README.md) | domain | supporting | stable | planned | fresh | candidate | Repository watch preferences, conversation participation and manual subscriptions, ignore preferences, and notification-interest decisions. |
| engagement | [notifications](../../apps/web/src/modules/engagement/notifications/README.md) | domain | supporting | stable | planned | fresh | candidate | User notification records, inboxes, reasons, filters, and read, saved, or done state. |
| integrations | [github-app-registrations](../../apps/web/src/modules/integrations/github-app-registrations/README.md) | domain | supporting | stable | planned | fresh | validated | GitHub App registration, ownership and ownership transfer, requested permissions, webhook preference, requested webhook events, and visibility. |
| integrations | [github-app-installations](../../apps/web/src/modules/integrations/github-app-installations/README.md) | domain | supporting | stable | planned | fresh | validated | GitHub App installation targets, selected repositories, granted permissions, suspension, and uninstall lifecycle. |
| integrations | [oauth-app-registrations](../../apps/web/src/modules/integrations/oauth-app-registrations/README.md) | domain | supporting | stable | planned | fresh | candidate | OAuth App registration, ownership, callback configuration, and client lifecycle. |
| integrations | [oauth-authorizations](../../apps/web/src/modules/integrations/oauth-authorizations/README.md) | domain | supporting | stable | planned | fresh | candidate | User authorization of registered OAuth Apps, scopes, approval, and revocation. |
| integrations | [repository-autolinks](../../apps/web/src/modules/integrations/repository-autolinks/README.md) | domain | supporting | stable | planned | fresh | validated | Repository-scoped autolink definitions for external resource references. |
| integrations | [webhooks](../../apps/web/src/modules/integrations/webhooks/README.md) | domain | supporting | stable | planned | fresh | candidate | Repository, organization, and enterprise webhook configuration plus GitHub App webhook projections, deliveries, attempts, and redelivery. |
| commerce | [billing](../../apps/web/src/modules/commerce/billing/README.md) | domain | supporting | stable | planned | unverified | candidate | Billing accounts, payment profiles, usage, budgets, cost centers, invoices, and spending allocation. |
| commerce | [entitlements](../../apps/web/src/modules/commerce/entitlements/README.md) | domain | supporting | stable | planned | unverified | candidate | Plans, feature entitlements, licenses, assignments, and usage limits. |
| governance | [audit-logs](../../apps/web/src/modules/governance/audit-logs/README.md) | domain | supporting | stable | planned | unverified | candidate | Organization and enterprise audit events, scopes, actors, targets, search, export, streaming, and retention policy. |
| projections | [search](../../apps/web/src/modules/projections/search/README.md) | projection | — | stable | planned | unverified | candidate | Permission-filtered search projections across users, organizations, repositories, issues, discussions, and projects. |
| projections | [dashboard](../../apps/web/src/modules/projections/dashboard/README.md) | projection | — | stable | active | fresh | validated | Available and selected personal or organization Dashboard contexts plus permission-filtered repository views. |
| projections | [activity-feed](../../apps/web/src/modules/projections/activity-feed/README.md) | projection | — | stable | planned | unverified | candidate | User-visible dashboard and resource activity projections. |
| projections | [repository-insights](../../apps/web/src/modules/projections/repository-insights/README.md) | projection | — | stable | planned | fresh | candidate | Non-code repository engagement trends and integration-health projections. |
| platform | [event-publication](../../apps/web/src/modules/platform/event-publication/README.md) | technical | — | stable | planned | not-applicable | not-applicable | Dispatch, leasing, retry, operational idempotency, redelivery, and dead-letter handling for context-owned event envelopes. |
| platform | [search-index](../../apps/web/src/modules/platform/search-index/README.md) | technical | — | stable | planned | not-applicable | not-applicable | Search document indexing, querying, and index lifecycle adapters. |
| platform | [media-storage](../../apps/web/src/modules/platform/media-storage/README.md) | technical | — | stable | planned | not-applicable | not-applicable | Storage and retrieval of media referenced by product domains. |
| platform | [notification-channels](../../apps/web/src/modules/platform/notification-channels/README.md) | technical | — | stable | planned | not-applicable | not-applicable | External email or push delivery adapters for accepted notification delivery requests. |
| platform | [audit-storage](../../apps/web/src/modules/platform/audit-storage/README.md) | technical | — | stable | planned | not-applicable | not-applicable | Durable storage, export, and retention enforcement for audit records. |

## Ownership and relationships

### [identity/accounts](../../apps/web/src/modules/identity/accounts/README.md)

- **Owns:** Account, Username, AccountLifecycle, GhostAttribution.
- **Excludes:** Credential, Session, Profile, EnterpriseMembership.
- **Activation scope:** get-account-reference-by-id, get-personal-account-by-username
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** AccountCreated@1 (domain; planned; contract pending), UsernameChanged@1 (domain; planned; contract pending), AccountDeleted@1 (domain; planned; contract pending)
- **Semantic claims:** personal-account-identity (owns Account, Username; events AccountCreated@1, UsernameChanged@1; sources identity-accounts-source-02, identity-accounts-source-03, identity-accounts-source-06); personal-account-deletion (owns AccountLifecycle, GhostAttribution; events AccountDeleted@1; sources identity-accounts-source-01, identity-accounts-source-04)
- **Official sources:** identity-accounts-source-01 ([personal accounts, account deletion, ghost attribution](https://docs.github.com/en/account-and-profile/concepts/account-management), checked 2026-07-23); identity-accounts-source-02 ([personal account identity, username, account creation](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github), checked 2026-07-23); identity-accounts-source-03 ([username changes, account namespace redirects](https://docs.github.com/en/account-and-profile/reference/username-reference), checked 2026-07-23); identity-accounts-source-04 ([personal account deletion, ghost attribution, username reuse after deletion](https://docs.github.com/en/account-and-profile/reference/personal-account-reference), checked 2026-07-23); identity-accounts-source-05 ([public user lookup by username, resource-not-found response](https://docs.github.com/en/rest/users/users#get-a-user), checked 2026-07-23); identity-accounts-source-06 ([personal accounts, managed user accounts, machine user account usage, organizations cannot sign in](https://docs.github.com/en/enterprise-cloud@latest/get-started/learning-about-github/types-of-github-accounts), checked 2026-07-23)

### [identity/authentication](../../apps/web/src/modules/identity/authentication/README.md)

- **Owns:** Credential, Session, TwoFactorConfiguration, ExternalLoginBinding.
- **Excludes:** AccountLifecycle, ScimProvisioning, OAuthAppAuthorization.
- **Activation scope:** create-development-session, expire-session, get-current-authenticated-session, list-browser-account-sessions, reauthenticate-session, remove-account-session, sign-out-all-sessions, switch-active-account-session
- **Runtime dependencies:** identity/accounts via AccountReference (synchronous)
- **Planned relationships:** None.
- **Published events:** SessionCreated@1 (domain; planned; contract pending), SessionRevoked@1 (domain; planned; contract pending), TwoFactorEnabled@1 (domain; planned; contract pending), TwoFactorDisabled@1 (domain; planned; contract pending), ExternalLoginLinked@1 (domain; planned; contract pending), ExternalLoginUnlinked@1 (domain; planned; contract pending)
- **Semantic claims:** authentication-session-lifecycle (owns Credential, Session; events SessionCreated@1, SessionRevoked@1; sources identity-authentication-source-01, identity-authentication-source-02); authentication-additional-factors (owns TwoFactorConfiguration, ExternalLoginBinding; events TwoFactorEnabled@1, TwoFactorDisabled@1, ExternalLoginLinked@1, ExternalLoginUnlinked@1; sources identity-authentication-source-01)
- **Official sources:** identity-authentication-source-01 ([authentication, sessions, two-factor authentication](https://docs.github.com/en/authentication), checked 2026-07-23); identity-authentication-source-02 ([multiple browser account sessions, active account switching, managed user reauthentication](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/switching-between-accounts), checked 2026-07-23)

### [identity/profiles](../../apps/web/src/modules/identity/profiles/README.md)

- **Owns:** UserProfile, ProfileVisibility, ProfileStatus, PinnedItemSet.
- **Excludes:** AccountLifecycle, RepositoryStar, Project.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via AccountReference (synchronous)
- **Published events:** ProfileUpdated@1 (domain; planned; contract pending), ProfileVisibilityChanged@1 (domain; planned; contract pending), ProfileStatusChanged@1 (domain; planned; contract pending), PinnedItemsChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** identity-profiles-source-01 ([profile, profile visibility, pinned items](https://docs.github.com/en/account-and-profile/concepts/personal-profile), unverified)

### [identity/social-graph](../../apps/web/src/modules/identity/social-graph/README.md)

- **Owns:** UserFollow, OrganizationFollow.
- **Excludes:** RepositoryStar, RepositorySubscription, ActivityFeed.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via AccountReference (synchronous); organizations/organizations via OrganizationReference (synchronous)
- **Published events:** UserFollowed@1 (domain; planned; contract pending), UserUnfollowed@1 (domain; planned; contract pending), OrganizationFollowed@1 (domain; planned; contract pending), OrganizationUnfollowed@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** identity-social-graph-source-01 ([following people, following organizations](https://docs.github.com/en/account-and-profile), unverified)

### [enterprises/enterprises](../../apps/web/src/modules/enterprises/enterprises/README.md)

- **Owns:** Enterprise, EnterpriseType, EnterpriseLifecycle, EnterpriseOrganizationLink.
- **Excludes:** EnterpriseMembership, EnterpriseRole, EnterprisePolicy.
- **Activation scope:** get-enterprise-by-slug, list-enterprise-organizations
- **Runtime dependencies:** organizations/organizations via OrganizationReference (synchronous)
- **Planned relationships:** identity/accounts via ActorReference (synchronous)
- **Published events:** EnterpriseCreated@1 (domain; planned; contract pending), EnterpriseProfileUpdated@1 (domain; planned; contract pending), EnterpriseOrganizationLinked@1 (domain; planned; contract pending), EnterpriseOrganizationUnlinked@1 (domain; planned; contract pending), EnterpriseLifecycleChanged@1 (domain; planned; contract pending)
- **Semantic claims:** enterprise-identity-and-organization-links (owns Enterprise, EnterpriseType, EnterpriseLifecycle, EnterpriseOrganizationLink; events EnterpriseCreated@1, EnterpriseProfileUpdated@1, EnterpriseOrganizationLinked@1, EnterpriseOrganizationUnlinked@1, EnterpriseLifecycleChanged@1; sources enterprises-enterprises-source-01, enterprises-enterprises-source-02)
- **Official sources:** enterprises-enterprises-source-01 ([enterprise accounts, enterprise organizations, enterprise organization ownership](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories), checked 2026-07-23); enterprises-enterprises-source-02 ([enterprise accounts contain organizations, enterprise accounts do not directly own repositories](https://docs.github.com/en/enterprise-cloud@latest/get-started/learning-about-github/types-of-github-accounts), checked 2026-07-23)

### [enterprises/enterprise-memberships](../../apps/web/src/modules/enterprises/enterprise-memberships/README.md)

- **Owns:** EnterpriseMembership, EnterpriseInvitation, EnterpriseAffiliation, GuestCollaboratorStatus.
- **Excludes:** OrganizationMembership, RepositoryGrant, License.
- **Activation scope:** list-active-enterprise-affiliations-for-account
- **Runtime dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via AccountReference (synchronous)
- **Planned relationships:** None.
- **Published events:** EnterpriseInvitationCreated@1 (domain; planned; contract pending), EnterpriseInvitationAccepted@1 (domain; planned; contract pending), EnterpriseInvitationRevoked@1 (domain; planned; contract pending), EnterpriseMemberAdded@1 (domain; planned; contract pending), EnterpriseMemberRemoved@1 (domain; planned; contract pending), EnterpriseAffiliationChanged@1 (domain; planned; contract pending), GuestCollaboratorStatusChanged@1 (domain; planned; contract pending)
- **Semantic claims:** enterprise-affiliation-lifecycle (owns EnterpriseMembership, EnterpriseInvitation, EnterpriseAffiliation, GuestCollaboratorStatus; events EnterpriseInvitationCreated@1, EnterpriseInvitationAccepted@1, EnterpriseInvitationRevoked@1, EnterpriseMemberAdded@1, EnterpriseMemberRemoved@1, EnterpriseAffiliationChanged@1, GuestCollaboratorStatusChanged@1; sources enterprises-enterprise-memberships-source-01)
- **Official sources:** enterprises-enterprise-memberships-source-01 ([enterprise members, unaffiliated users, guest collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise), checked 2026-07-23)

### [enterprises/enterprise-teams](../../apps/web/src/modules/enterprises/enterprise-teams/README.md)

- **Owns:** EnterpriseTeam, EnterpriseTeamMembership, EnterpriseTeamOrganizationGrant.
- **Excludes:** OrganizationTeam, RepositoryGrant, CostCenter.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseMemberReference (synchronous)
- **Published events:** EnterpriseTeamCreated@1 (domain; planned; contract pending), EnterpriseTeamUpdated@1 (domain; planned; contract pending), EnterpriseTeamDeleted@1 (domain; planned; contract pending), EnterpriseTeamMemberAdded@1 (domain; planned; contract pending), EnterpriseTeamMemberRemoved@1 (domain; planned; contract pending), EnterpriseTeamOrganizationGranted@1 (domain; planned; contract pending), EnterpriseTeamOrganizationRevoked@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** enterprises-enterprise-teams-source-01 ([enterprise teams, enterprise team membership](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise), unverified)

### [enterprises/enterprise-roles](../../apps/web/src/modules/enterprises/enterprise-roles/README.md)

- **Owns:** EnterpriseRoleDefinition, EnterpriseRoleAssignment, EnterprisePermission.
- **Excludes:** OrganizationRole, RepositoryRole, BillingAccount.
- **Activation scope:** authorize-enterprise-administration
- **Runtime dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseAffiliation (synchronous)
- **Planned relationships:** enterprises/enterprise-teams via EnterpriseTeamReference (synchronous)
- **Published events:** EnterpriseRoleDefined@1 (domain; planned; contract pending), EnterpriseRoleUpdated@1 (domain; planned; contract pending), EnterpriseRoleDeleted@1 (domain; planned; contract pending), EnterpriseRoleAssigned@1 (domain; planned; contract pending), EnterpriseRoleRevoked@1 (domain; planned; contract pending)
- **Semantic claims:** enterprise-role-administration (owns EnterpriseRoleDefinition, EnterpriseRoleAssignment, EnterprisePermission; events EnterpriseRoleDefined@1, EnterpriseRoleUpdated@1, EnterpriseRoleDeleted@1, EnterpriseRoleAssigned@1, EnterpriseRoleRevoked@1; sources enterprises-enterprise-roles-source-01)
- **Official sources:** enterprises-enterprise-roles-source-01 ([enterprise roles, custom enterprise roles, enterprise permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles), checked 2026-07-23)

### [enterprises/enterprise-iam](../../apps/web/src/modules/enterprises/enterprise-iam/README.md)

- **Owns:** IdentityProviderConfiguration, ProvisionedIdentity, ExternalGroupBinding, SetupUserConfiguration.
- **Excludes:** InteractiveSession, AccountProfile, OrganizationRole.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via ManagedAccountProvisioning (synchronous); identity/authentication via ExternalAuthenticationBinding (synchronous); enterprises/enterprise-memberships via EnterpriseMembershipProvisioning (synchronous)
- **Published events:** IdentityProviderConfigured@1 (domain; planned; contract pending), ProvisionedIdentityCreated@1 (domain; planned; contract pending), ProvisionedIdentitySuspended@1 (domain; planned; contract pending), ProvisionedIdentityReinstated@1 (domain; planned; contract pending), ProvisionedIdentityDeprovisioned@1 (domain; planned; contract pending), ExternalGroupLinked@1 (domain; planned; contract pending), ExternalGroupUnlinked@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** enterprises-enterprise-iam-source-01 ([enterprise IAM, SAML, OIDC, SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam), unverified)

### [enterprises/enterprise-policies](../../apps/web/src/modules/enterprises/enterprise-policies/README.md)

- **Owns:** EnterprisePolicy, EnterprisePolicyEnforcement, OrganizationPolicyOverrideState.
- **Excludes:** OrganizationPolicy, CodeRuleset, ActionsPolicy.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** EnterprisePolicyChanged@1 (domain; planned; contract pending), EnterprisePolicyEnforcementChanged@1 (domain; planned; contract pending), OrganizationPolicyOverrideChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** enterprises-enterprise-policies-source-01 ([enterprise policies, organization constraints, repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies), unverified)

### [enterprises/custom-properties](../../apps/web/src/modules/enterprises/custom-properties/README.md)

- **Owns:** EnterpriseRepositoryPropertyDefinition, EnterpriseOrganizationPropertyDefinition, EnterprisePropertyDefault, EnterprisePropertyEditPolicy, OrganizationPropertyValue, EnterpriseRepositoryPropertyPromotion.
- **Excludes:** OrganizationRepositoryPropertyDefinition, RepositoryPropertyValue, RepositoryTopic, IssueField.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** enterprises/enterprises via EnterpriseReference (synchronous); organizations/organizations via OrganizationReference (synchronous); organizations/custom-properties via OrganizationPropertyPromotionRequests (event) [OrganizationRepositoryPropertyPromotionRequested@1]
- **Published events:** EnterpriseRepositoryPropertyDefined@1 (domain; planned; contract pending), EnterpriseRepositoryPropertyUpdated@1 (domain; planned; contract pending), EnterpriseRepositoryPropertyDeleted@1 (domain; planned; contract pending), EnterpriseRepositoryPropertyPromoted@1 (domain; planned; contract pending), EnterpriseOrganizationPropertyDefined@1 (domain; planned; contract pending), EnterpriseOrganizationPropertyUpdated@1 (domain; planned; contract pending), EnterpriseOrganizationPropertyDeleted@1 (domain; planned; contract pending), OrganizationPropertyValueSet@1 (domain; planned; contract pending), OrganizationPropertyValueCleared@1 (domain; planned; contract pending)
- **Semantic claims:** enterprise-repository-properties (owns EnterpriseRepositoryPropertyDefinition, EnterprisePropertyDefault, EnterprisePropertyEditPolicy, EnterpriseRepositoryPropertyPromotion; events EnterpriseRepositoryPropertyDefined@1, EnterpriseRepositoryPropertyUpdated@1, EnterpriseRepositoryPropertyDeleted@1, EnterpriseRepositoryPropertyPromoted@1; sources enterprises-custom-properties-source-01); enterprise-organization-properties (owns EnterpriseOrganizationPropertyDefinition, OrganizationPropertyValue; events EnterpriseOrganizationPropertyDefined@1, EnterpriseOrganizationPropertyUpdated@1, EnterpriseOrganizationPropertyDeleted@1, OrganizationPropertyValueSet@1, OrganizationPropertyValueCleared@1; sources enterprises-custom-properties-source-02)
- **Official sources:** enterprises-custom-properties-source-01 ([enterprise-defined repository properties, enterprise defaults and edit policy, organization property promotion](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/managing-custom-properties-for-repositories-in-your-enterprise), checked 2026-07-22); enterprises-custom-properties-source-02 ([enterprise-defined organization properties, organization property values, organization property defaults](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-organizations-in-your-enterprise/managing-custom-properties-for-organizations), checked 2026-07-22)

### [organizations/organizations](../../apps/web/src/modules/organizations/organizations/README.md)

- **Owns:** Organization, OrganizationProfile, OrganizationLifecycle, VerifiedDomain.
- **Excludes:** OrganizationMembership, OrganizationTeam, Repository, EnterpriseOrganizationLink.
- **Activation scope:** get-organization-by-login, get-organization-reference-by-id
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** OrganizationCreated@1 (domain; planned; contract pending), OrganizationProfileUpdated@1 (domain; planned; contract pending), OrganizationRenamed@1 (domain; planned; contract pending), OrganizationLifecycleChanged@1 (domain; planned; contract pending), VerifiedDomainAdded@1 (domain; planned; contract pending), VerifiedDomainRemoved@1 (domain; planned; contract pending)
- **Semantic claims:** organization-identity-and-lifecycle (owns Organization, OrganizationProfile, OrganizationLifecycle, VerifiedDomain; events OrganizationCreated@1, OrganizationProfileUpdated@1, OrganizationRenamed@1, OrganizationLifecycleChanged@1, VerifiedDomainAdded@1, VerifiedDomainRemoved@1; sources organizations-organizations-source-01)
- **Official sources:** organizations-organizations-source-01 ([organizations, organization ownership, organization profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations), checked 2026-07-23)

### [organizations/organization-memberships](../../apps/web/src/modules/organizations/organization-memberships/README.md)

- **Owns:** OrganizationMembership, OrganizationInvitation, MembershipRole, MembershipState.
- **Excludes:** OutsideCollaborator, RepositoryInvitation, EnterpriseRole.
- **Activation scope:** check-organization-context-eligibility, list-active-organization-memberships-for-account
- **Runtime dependencies:** organizations/organizations via OrganizationReference (synchronous); identity/accounts via AccountReference (synchronous)
- **Planned relationships:** enterprises/enterprise-memberships via EnterpriseAffiliation (synchronous)
- **Published events:** OrganizationInvitationCreated@1 (domain; planned; contract pending), OrganizationInvitationAccepted@1 (domain; planned; contract pending), OrganizationInvitationRevoked@1 (domain; planned; contract pending), OrganizationMemberAdded@1 (domain; planned; contract pending), OrganizationMemberRemoved@1 (domain; planned; contract pending), OrganizationMemberRoleChanged@1 (domain; planned; contract pending)
- **Semantic claims:** organization-membership-lifecycle (owns OrganizationMembership, OrganizationInvitation, MembershipRole, MembershipState; events OrganizationInvitationCreated@1, OrganizationInvitationAccepted@1, OrganizationInvitationRevoked@1, OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1; sources organizations-organization-memberships-source-01)
- **Official sources:** organizations-organization-memberships-source-01 ([organization membership, organization invitations, membership lifecycle](https://docs.github.com/en/organizations/managing-membership-in-your-organization), checked 2026-07-23)

### [organizations/organization-teams](../../apps/web/src/modules/organizations/organization-teams/README.md)

- **Owns:** OrganizationTeam, TeamMembership, TeamMaintainer, ParentTeamReference, TeamVisibility.
- **Excludes:** EnterpriseTeam, OutsideCollaborator, RepositoryRole.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMembershipReference (synchronous)
- **Published events:** OrganizationTeamCreated@1 (domain; planned; contract pending), OrganizationTeamUpdated@1 (domain; planned; contract pending), OrganizationTeamDeleted@1 (domain; planned; contract pending), TeamMemberAdded@1 (domain; planned; contract pending), TeamMemberRemoved@1 (domain; planned; contract pending), TeamMaintainerChanged@1 (domain; planned; contract pending), ParentTeamChanged@1 (domain; planned; contract pending), TeamVisibilityChanged@1 (domain; planned; contract pending)
- **Semantic claims:** organization-team-membership-and-maintainers (owns TeamMembership, TeamMaintainer; events OrganizationTeamCreated@1, OrganizationTeamUpdated@1, OrganizationTeamDeleted@1, TeamMemberAdded@1, TeamMemberRemoved@1, TeamMaintainerChanged@1, ParentTeamChanged@1, TeamVisibilityChanged@1; sources organizations-organization-teams-source-01); organization-team-hierarchy-and-visibility (owns OrganizationTeam, ParentTeamReference, TeamVisibility; events ParentTeamChanged@1, TeamVisibilityChanged@1; sources organizations-organization-teams-source-01)
- **Official sources:** organizations-organization-teams-source-01 ([organization teams, nested teams, team visibility, team maintainers](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams), checked 2026-07-23)

### [organizations/organization-roles](../../apps/web/src/modules/organizations/organization-roles/README.md)

- **Owns:** OrganizationRoleDefinition, OrganizationRoleAssignment, OrganizationPermission, CustomRepositoryRoleDefinition.
- **Excludes:** EnterpriseRole, RepositoryRoleAssignment, TeamMaintainer.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMembershipReference (synchronous); organizations/organization-teams via OrganizationTeamReference (synchronous)
- **Published events:** OrganizationRoleDefined@1 (domain; planned; contract pending), OrganizationRoleUpdated@1 (domain; planned; contract pending), OrganizationRoleDeleted@1 (domain; planned; contract pending), OrganizationRoleAssigned@1 (domain; planned; contract pending), OrganizationRoleRevoked@1 (domain; planned; contract pending), CustomRepositoryRoleDefined@1 (domain; planned; contract pending), CustomRepositoryRoleUpdated@1 (domain; planned; contract pending), CustomRepositoryRoleDeleted@1 (domain; planned; contract pending)
- **Semantic claims:** predefined-organization-role-assignments (owns OrganizationRoleDefinition, OrganizationRoleAssignment, OrganizationPermission; events OrganizationRoleDefined@1, OrganizationRoleUpdated@1, OrganizationRoleDeleted@1, OrganizationRoleAssigned@1, OrganizationRoleRevoked@1; sources organizations-organization-roles-source-01, organizations-organization-roles-source-02, organizations-organization-roles-source-03); custom-organization-and-repository-role-definitions (owns CustomRepositoryRoleDefinition; events CustomRepositoryRoleDefined@1, CustomRepositoryRoleUpdated@1, CustomRepositoryRoleDeleted@1; sources organizations-organization-roles-source-01)
- **Official sources:** organizations-organization-roles-source-01 ([organization roles, custom organization roles, custom repository roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization), checked 2026-07-23); organizations-organization-roles-source-02 ([organization role assignments, user and team role subjects, multiple role assignments](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/using-organization-roles), checked 2026-07-23); organizations-organization-roles-source-03 ([predefined organization roles, all-repository permissions, security manager repository read](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-peoples-access-to-your-organization-with-roles/permissions-of-predefined-organization-roles), checked 2026-07-23)

### [organizations/organization-policies](../../apps/web/src/modules/organizations/organization-policies/README.md)

- **Owns:** RepositoryCreationPolicy, RepositoryVisibilityPolicy, OutsideCollaboratorPolicy, ProjectPolicy, DiscussionPolicy, BaseRepositoryPermission.
- **Excludes:** EnterprisePolicy, RepositoryGrant, CodeRuleset.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); enterprises/enterprise-policies via EnterprisePolicyConstraints (synchronous)
- **Published events:** OrganizationPolicyChanged@1 (domain; planned; contract pending), BaseRepositoryPermissionChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** organizations-organization-policies-source-01 ([organization settings, member privileges, repository policies](https://docs.github.com/en/organizations/managing-organization-settings), unverified)

### [organizations/custom-properties](../../apps/web/src/modules/organizations/custom-properties/README.md)

- **Owns:** OrganizationRepositoryPropertyDefinition, OrganizationRepositoryPropertyAllowedValue, RepositoryPropertyValue, RepositoryPropertyValueSource, RequiredRepositoryPropertyPolicy, ExplicitRepositoryPropertyRequirement, OrganizationRepositoryPropertyPromotionRequest.
- **Excludes:** EnterprisePropertyDefinition, OrganizationPropertyValue, RepositoryTopic, ProjectField, IssueField.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); enterprises/custom-properties via EnterpriseRepositoryPropertyDefinition (synchronous); repositories/repositories via RepositoryLifecycleState (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]; enterprises/custom-properties via EnterprisePropertyPromotionEvents (event) [EnterpriseRepositoryPropertyPromoted@1]
- **Published events:** OrganizationRepositoryPropertyDefined@1 (domain; planned; contract pending), OrganizationRepositoryPropertyUpdated@1 (domain; planned; contract pending), OrganizationRepositoryPropertyDeleted@1 (domain; planned; contract pending), OrganizationRepositoryPropertyPromotionRequested@1 (domain; planned; contract pending), RepositoryPropertyValueSet@1 (domain; planned; contract pending), RepositoryPropertyValueCleared@1 (domain; planned; contract pending)
- **Semantic claims:** organization-repository-property-schema (owns OrganizationRepositoryPropertyDefinition, OrganizationRepositoryPropertyAllowedValue, RequiredRepositoryPropertyPolicy, ExplicitRepositoryPropertyRequirement, OrganizationRepositoryPropertyPromotionRequest; events OrganizationRepositoryPropertyDefined@1, OrganizationRepositoryPropertyUpdated@1, OrganizationRepositoryPropertyDeleted@1, OrganizationRepositoryPropertyPromotionRequested@1; sources organizations-custom-properties-source-01); organization-repository-property-values (owns RepositoryPropertyValue, RepositoryPropertyValueSource; events RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1; sources organizations-custom-properties-source-01)
- **Official sources:** organizations-custom-properties-source-01 ([organization-defined repository property definitions, repository property values, required defaults and explicit values](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization), checked 2026-07-22)

### [repositories/repositories](../../apps/web/src/modules/repositories/repositories/README.md)

- **Owns:** Repository, RepositoryDescription, RepositoryHomepage, RepositoryRedirect, RepositoryTransfer, RepositoryLifecycleState, RepositoryTombstone, RepositoryRestoreWindow.
- **Excludes:** GitObject, RepositoryGrant, Issue, Star, Subscription.
- **Activation scope:** get-repository-by-owner-and-name, list-active-public-repositories-for-organization-owner, list-active-public-repositories-for-personal-owner, list-active-repositories-for-owner
- **Runtime dependencies:** identity/accounts via UserOwnerReference (synchronous); organizations/organizations via OrganizationOwnerReference (synchronous)
- **Planned relationships:** organizations/organization-policies via RepositoryPolicyConstraints (synchronous); commerce/entitlements via RepositoryEntitlement (synchronous)
- **Published events:** RepositoryCreated@1 (domain; planned; contract pending), RepositoryProfileUpdated@1 (domain; planned; contract pending), RepositoryRenamed@1 (domain; planned; contract pending), RepositoryVisibilityChanged@1 (domain; planned; contract pending), RepositoryTransferRequested@1 (domain; planned; contract pending), RepositoryTransferred@1 (domain; planned; contract pending), RepositoryTransferExpired@1 (domain; planned; contract pending), RepositoryArchived@1 (domain; planned; contract pending), RepositoryUnarchived@1 (domain; planned; contract pending), RepositoryDeleted@1 (domain; planned; contract pending), RepositoryRestored@1 (domain; planned; contract pending)
- **Semantic claims:** repository-identity-and-profile (owns Repository, RepositoryDescription, RepositoryHomepage; events RepositoryCreated@1, RepositoryProfileUpdated@1; sources repositories-repositories-source-01, repositories-repositories-source-02, repositories-repositories-source-09); repository-rename-and-redirect (owns RepositoryRedirect; events RepositoryRenamed@1; sources repositories-repositories-source-08); repository-visibility (no ownership entries; events RepositoryVisibilityChanged@1; sources repositories-repositories-source-04); repository-transfer (owns RepositoryTransfer; events RepositoryTransferRequested@1, RepositoryTransferred@1, RepositoryTransferExpired@1; sources repositories-repositories-source-03); repository-lifecycle (owns RepositoryLifecycleState, RepositoryTombstone, RepositoryRestoreWindow; events RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1; sources repositories-repositories-source-05, repositories-repositories-source-06, repositories-repositories-source-07)
- **Official sources:** repositories-repositories-source-01 ([repository identity, ownership](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories), checked 2026-07-22); repositories-repositories-source-02 ([repository creation, name, description, visibility](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository), checked 2026-07-22); repositories-repositories-source-03 ([repository transfer, personal-account transfer acceptance and expiry, transfer effects](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-23); repositories-repositories-source-04 ([visibility changes, visibility-change effects](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22); repositories-repositories-source-05 ([archive, unarchive, archived repository read-only behavior, archived repository starring](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories), checked 2026-07-22); repositories-repositories-source-06 ([repository deletion, permanent team permission removal](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository), checked 2026-07-22); repositories-repositories-source-07 ([repository restoration, restore window, team permissions excluded from restoration](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository), checked 2026-07-22); repositories-repositories-source-08 ([repository rename, redirects](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository), checked 2026-07-22); repositories-repositories-source-09 ([repository description updates, repository homepage updates](https://docs.github.com/en/rest/repos/repos), checked 2026-07-22); repositories-repositories-source-10 ([repository dashboard listing, owner repository views, visibility filtering](https://docs.github.com/en/repositories/creating-and-managing-repositories/viewing-all-your-repositories), checked 2026-07-23); repositories-repositories-source-11 ([public repositories for a specified user, owner repository filtering](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user), checked 2026-07-23)

### [repositories/repository-access](../../apps/web/src/modules/repositories/repository-access/README.md)

- **Owns:** RepositoryGrant, RepositoryInvitation, RepositoryInvitationState, OutsideCollaboratorGrant, TeamRepositoryGrant, RepositoryRoleAssignment, EffectiveRepositoryPermissionDecision.
- **Excludes:** OrganizationMembership, OrganizationRoleDefinition, EffectivePermissionAsSourceOfTruth.
- **Activation scope:** resolve-effective-repository-permission
- **Runtime dependencies:** repositories/repositories via RepositoryCandidateReference (synchronous); identity/accounts via AccountReference (synchronous); organizations/organization-memberships via OrganizationMembershipReference (synchronous)
- **Planned relationships:** organizations/organization-teams via TeamRepositoryPermissionContribution (synchronous); organizations/organization-roles via OrganizationRepositoryRoleContribution (synchronous); organizations/organization-policies via OrganizationRepositoryPolicyContribution (synchronous); enterprises/enterprise-teams via EnterpriseTeamPermissionContribution (synchronous); enterprises/enterprise-roles via EnterpriseRepositoryPermissionContribution (synchronous); repositories/repositories via RepositoryLifecycleEvents (event) [RepositoryTransferred@1, RepositoryDeleted@1]
- **Published events:** RepositoryInvitationCreated@1 (domain; planned; contract pending), RepositoryInvitationPermissionChanged@1 (domain; planned; contract pending), RepositoryInvitationAccepted@1 (domain; planned; contract pending), RepositoryInvitationDeclined@1 (domain; planned; contract pending), RepositoryInvitationRevoked@1 (domain; planned; contract pending), RepositoryAccessGranted@1 (domain; planned; contract pending), RepositoryAccessChanged@1 (domain; planned; contract pending), RepositoryAccessRevoked@1 (domain; planned; contract pending), TeamRepositoryAccessGranted@1 (domain; planned; contract pending), TeamRepositoryAccessRevoked@1 (domain; planned; contract pending), OutsideCollaboratorAccessGranted@1 (domain; planned; contract pending), OutsideCollaboratorAccessRevoked@1 (domain; planned; contract pending)
- **Semantic claims:** repository-invitation-lifecycle (owns RepositoryInvitation, RepositoryInvitationState; events RepositoryInvitationCreated@1, RepositoryInvitationPermissionChanged@1, RepositoryInvitationAccepted@1, RepositoryInvitationDeclined@1, RepositoryInvitationRevoked@1; sources repositories-repository-access-source-06, repositories-repository-access-source-07); repository-role-and-effective-permission (owns RepositoryGrant, RepositoryRoleAssignment, EffectiveRepositoryPermissionDecision; events RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1; sources repositories-repository-access-source-01, repositories-repository-access-source-02); team-repository-access (owns TeamRepositoryGrant; events TeamRepositoryAccessGranted@1, TeamRepositoryAccessRevoked@1; sources repositories-repository-access-source-01, repositories-repository-access-source-03, repositories-repository-access-source-04, repositories-repository-access-source-05); outside-collaborator-access (owns OutsideCollaboratorGrant; events OutsideCollaboratorAccessGranted@1, OutsideCollaboratorAccessRevoked@1; sources repositories-repository-access-source-01)
- **Official sources:** repositories-repository-access-source-01 ([organization repository roles, base permissions, organization owner privilege](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization), checked 2026-07-22); repositories-repository-access-source-02 ([personal repository owner, personal repository collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository), checked 2026-07-22); repositories-repository-access-source-03 ([direct team access, inherited team access](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/managing-team-access-to-an-organization-repository), checked 2026-07-22); repositories-repository-access-source-04 ([permanent team permission deletion](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository), checked 2026-07-22); repositories-repository-access-source-05 ([team permissions excluded from restoration](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository), checked 2026-07-22); repositories-repository-access-source-06 ([repository collaborator invitation creation](https://docs.github.com/en/rest/collaborators/collaborators), checked 2026-07-22); repositories-repository-access-source-07 ([open repository invitations, pending invitation permission changes, invitation acceptance, invitation decline, invitation revocation](https://docs.github.com/en/rest/collaborators/invitations), checked 2026-07-23)

### [repositories/repository-features](../../apps/web/src/modules/repositories/repository-features/README.md)

- **Owns:** IssuesFeatureConfiguration, IssueCreationPolicy, RepositoryDiscussionsFeatureState, ProjectsFeatureConfiguration, RepositoryWikiFeatureState.
- **Excludes:** Actions, Pages, Packages, SecurityScanning, WikiContent.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleState (synchronous); organizations/organization-policies via FeaturePolicyConstraints (synchronous); commerce/entitlements via FeatureEntitlement (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]
- **Published events:** RepositoryIssuesFeatureChanged@1 (domain; planned; contract pending), RepositoryDiscussionsEnabled@1 (domain; planned; contract pending), RepositoryDiscussionsDisabled@1 (domain; planned; contract pending), RepositoryProjectsFeatureChanged@1 (domain; planned; contract pending), RepositoryWikiEnabled@1 (domain; planned; contract pending), RepositoryWikiDisabled@1 (domain; planned; contract pending)
- **Semantic claims:** repository-issues-feature (owns IssuesFeatureConfiguration, IssueCreationPolicy; events RepositoryIssuesFeatureChanged@1; sources repositories-repository-features-source-01); repository-discussions-feature (owns RepositoryDiscussionsFeatureState; events RepositoryDiscussionsEnabled@1, RepositoryDiscussionsDisabled@1; sources repositories-repository-features-source-03); repository-projects-feature (owns ProjectsFeatureConfiguration; events RepositoryProjectsFeatureChanged@1; sources repositories-repository-features-source-04); repository-wiki-feature (owns RepositoryWikiFeatureState; events RepositoryWikiEnabled@1, RepositoryWikiDisabled@1; sources repositories-repository-features-source-05)
- **Official sources:** repositories-repository-features-source-01 ([issues enablement, collaborators-only issue creation, issue preservation while disabled](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-issues), checked 2026-07-22); repositories-repository-features-source-03 ([repository discussions enablement, repository admin enablement permission](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository), checked 2026-07-22); repositories-repository-features-source-04 ([repository Projects tab enablement, linked project preservation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-projects-in-a-repository), checked 2026-07-22); repositories-repository-features-source-02 ([feature loss after transfer, plan-dependent transfer effects](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-22); repositories-repository-features-source-05 ([wiki enablement, wiki content preservation while disabled](https://docs.github.com/en/communities/documenting-your-project-with-wikis/disabling-wikis), checked 2026-07-22)

### [repositories/repository-metadata](../../apps/web/src/modules/repositories/repository-metadata/README.md)

- **Owns:** RepositoryTopicSet, RepositorySocialPreview.
- **Excludes:** RepositoryDescription, RepositoryHomepage, CustomPropertyDefinition, RepositoryPropertyValue, RepositoryContent.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleState (synchronous); platform/media-storage via MediaReference (synchronous)
- **Published events:** RepositoryTopicsChanged@1 (domain; planned; contract pending), RepositorySocialPreviewChanged@1 (domain; planned; contract pending), RepositorySocialPreviewRemoved@1 (domain; planned; contract pending)
- **Semantic claims:** repository-topic-set (owns RepositoryTopicSet; events RepositoryTopicsChanged@1; sources repositories-repository-metadata-source-01); repository-social-preview (owns RepositorySocialPreview; events RepositorySocialPreviewChanged@1, RepositorySocialPreviewRemoved@1; sources repositories-repository-metadata-source-02)
- **Official sources:** repositories-repository-metadata-source-01 ([topics, topic limits, public topic names](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics), checked 2026-07-23); repositories-repository-metadata-source-02 ([social-media preview, preview image restrictions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview), checked 2026-07-23)

### [collaboration/issues](../../apps/web/src/modules/collaboration/issues/README.md)

- **Owns:** Issue, SubIssueRelation, IssueDependency, IssueTransfer, IssueTypeSelection, IssueFieldValueSet.
- **Excludes:** Comment, LabelDefinition, Project, PullRequest.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleState (synchronous); repositories/repository-access via RepositoryPermission (synchronous); repositories/repository-features via IssueFeatureState (synchronous); collaboration/issue-schema via IssueSchemaReference (synchronous); collaboration/labels-and-milestones via TaxonomyReference (synchronous); collaboration/conversations via IssueConversation (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]
- **Published events:** IssueCreated@1 (domain; planned; contract pending), IssueUpdated@1 (domain; planned; contract pending), IssueClosed@1 (domain; planned; contract pending), IssueReopened@1 (domain; planned; contract pending), IssueAssigned@1 (domain; planned; contract pending), IssueUnassigned@1 (domain; planned; contract pending), SubIssueAdded@1 (domain; planned; contract pending), SubIssueRemoved@1 (domain; planned; contract pending), IssueDependencyAdded@1 (domain; planned; contract pending), IssueDependencyRemoved@1 (domain; planned; contract pending), IssueTransferred@1 (domain; planned; contract pending), IssueFieldValueSet@1 (domain; planned; contract pending), IssueFieldValueCleared@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-issues-source-01 ([issues, sub-issues, issue dependencies, issue metadata](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues), checked 2026-07-22); collaboration-issues-source-02 ([issue field values, issue field value permissions](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields), checked 2026-07-22); collaboration-issues-source-03 ([assignee reconciliation, issue type reconciliation](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-22)

### [collaboration/issue-schema](../../apps/web/src/modules/collaboration/issue-schema/README.md)

- **Owns:** IssueTypeDefinition, IssueFieldDefinition, IssueFieldVisibility, IssueFieldPinning, IssueTypeFieldAssociation.
- **Excludes:** ProjectField, CustomPropertyDefinition, Label, IssueFieldValue.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-policies via IssueSchemaPolicy (synchronous); commerce/entitlements via IssueSchemaEntitlement (synchronous)
- **Published events:** IssueTypeDefined@1 (domain; planned; contract pending), IssueTypeUpdated@1 (domain; planned; contract pending), IssueTypeRetired@1 (domain; planned; contract pending), IssueFieldDefined@1 (domain; planned; contract pending), IssueFieldUpdated@1 (domain; planned; contract pending), IssueFieldRetired@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-issue-schema-source-01 ([organization issue fields, field visibility, field pinning, type-field associations](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization), checked 2026-07-22); collaboration-issue-schema-source-02 ([organization issue types, issue type lifecycle](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-types-in-an-organization), checked 2026-07-22)

### [collaboration/labels-and-milestones](../../apps/web/src/modules/collaboration/labels-and-milestones/README.md)

- **Owns:** LabelCatalog, Label, Milestone.
- **Excludes:** Issue, Discussion, OrganizationDefaultLabelPolicy.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleState (synchronous)
- **Published events:** LabelCreated@1 (domain; planned; contract pending), LabelUpdated@1 (domain; planned; contract pending), LabelDeleted@1 (domain; planned; contract pending), MilestoneCreated@1 (domain; planned; contract pending), MilestoneUpdated@1 (domain; planned; contract pending), MilestoneClosed@1 (domain; planned; contract pending), MilestoneReopened@1 (domain; planned; contract pending), MilestoneDeleted@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-labels-and-milestones-source-01 ([labels, milestones, work classification](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work), unverified)

### [collaboration/conversations](../../apps/web/src/modules/collaboration/conversations/README.md)

- **Owns:** Conversation, Comment, Reply, Reaction, Mention, CommentRevision, ConversationSubjectKind, ConversationCapabilities.
- **Excludes:** IssueState, DiscussionCategory, ModerationCase, ArbitrarySubjectType.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via ActorReference (synchronous); repositories/repositories via RepositoryLifecycleState (synchronous)
- **Published events:** ConversationCreated@1 (domain; planned; contract pending), ConversationLocked@1 (domain; planned; contract pending), ConversationUnlocked@1 (domain; planned; contract pending), CommentAdded@1 (domain; planned; contract pending), CommentEdited@1 (domain; planned; contract pending), CommentDeleted@1 (domain; planned; contract pending), ReplyAdded@1 (domain; planned; contract pending), ReactionAdded@1 (domain; planned; contract pending), ReactionRemoved@1 (domain; planned; contract pending), MentionDetected@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-conversations-source-01 ([comments, mentions, reactions](https://docs.github.com/en/get-started/using-github/communicating-on-github), checked 2026-07-22); collaboration-conversations-source-02 ([discussion comment threads, threaded replies](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion), checked 2026-07-22); collaboration-conversations-source-03 ([issue conversation locks, locked-conversation behavior](https://docs.github.com/en/communities/moderating-comments-and-conversations/locking-conversations), checked 2026-07-22)

### [collaboration/discussions](../../apps/web/src/modules/collaboration/discussions/README.md)

- **Owns:** RepositoryDiscussionForum, OrganizationDiscussionSpace, Discussion, DiscussionCategory, DiscussionSection, DiscussionPoll, AcceptedAnswer, PinnedDiscussion.
- **Excludes:** Comment, LabelDefinition, Issue, TeamDiscussion.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleAndOwnership (synchronous); organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via DiscussionPermission (synchronous); repositories/repository-features via RepositoryDiscussionFeatureState (synchronous); repositories/repository-features via RepositoryDiscussionFeatureEvents (event) [RepositoryDiscussionsEnabled@1, RepositoryDiscussionsDisabled@1]; collaboration/labels-and-milestones via LabelReference (synchronous); collaboration/conversations via DiscussionConversation (synchronous); organizations/organization-memberships via OrganizationDiscussionAdministration (synchronous); organizations/organization-policies via DiscussionCreationPolicy (synchronous)
- **Published events:** DiscussionCreated@1 (domain; planned; contract pending), DiscussionUpdated@1 (domain; planned; contract pending), DiscussionClosed@1 (domain; planned; contract pending), DiscussionReopened@1 (domain; planned; contract pending), DiscussionDeleted@1 (domain; planned; contract pending), DiscussionTransferred@1 (domain; planned; contract pending), DiscussionCategoryCreated@1 (domain; planned; contract pending), DiscussionCategoryUpdated@1 (domain; planned; contract pending), DiscussionCategoryDeleted@1 (domain; planned; contract pending), DiscussionSectionCreated@1 (domain; planned; contract pending), DiscussionSectionUpdated@1 (domain; planned; contract pending), DiscussionSectionDeleted@1 (domain; planned; contract pending), DiscussionAnswerMarked@1 (domain; planned; contract pending), DiscussionAnswerUnmarked@1 (domain; planned; contract pending), DiscussionPinned@1 (domain; planned; contract pending), DiscussionUnpinned@1 (domain; planned; contract pending), OrganizationDiscussionSpaceEnabled@1 (domain; planned; contract pending), OrganizationDiscussionSpaceDisabled@1 (domain; planned; contract pending), OrganizationDiscussionSourceChanged@1 (domain; planned; contract pending)
- **Semantic claims:** discussion-forums-and-categories (owns RepositoryDiscussionForum, Discussion, DiscussionCategory, DiscussionSection; events DiscussionCreated@1, DiscussionUpdated@1, DiscussionCategoryCreated@1, DiscussionCategoryUpdated@1, DiscussionCategoryDeleted@1, DiscussionSectionCreated@1, DiscussionSectionUpdated@1, DiscussionSectionDeleted@1; sources collaboration-discussions-source-01, collaboration-discussions-source-05, collaboration-discussions-source-08); discussion-lifecycle-and-transfer (no ownership entries; events DiscussionClosed@1, DiscussionReopened@1, DiscussionDeleted@1, DiscussionTransferred@1; sources collaboration-discussions-source-02, collaboration-discussions-source-05, collaboration-discussions-source-08); discussion-answers-polls-and-pins (owns DiscussionPoll, AcceptedAnswer, PinnedDiscussion; events DiscussionAnswerMarked@1, DiscussionAnswerUnmarked@1, DiscussionPinned@1, DiscussionUnpinned@1; sources collaboration-discussions-source-02, collaboration-discussions-source-06, collaboration-discussions-source-07, collaboration-discussions-source-08); organization-discussion-source-repository (owns OrganizationDiscussionSpace; events OrganizationDiscussionSpaceEnabled@1, OrganizationDiscussionSpaceDisabled@1; sources collaboration-discussions-source-04); organization-discussion-source-change (no ownership entries; events OrganizationDiscussionSourceChanged@1; sources collaboration-discussions-source-04)
- **Official sources:** collaboration-discussions-source-01 ([repository discussions, organization discussions, discussion categories](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions), checked 2026-07-22); collaboration-discussions-source-02 ([pins, transfer, discussion lifecycle](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions), checked 2026-07-23); collaboration-discussions-source-03 ([repository discussion availability prerequisite](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository), checked 2026-07-22); collaboration-discussions-source-04 ([organization discussion enablement, source repository, source-repository permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/enabling-or-disabling-github-discussions-for-an-organization), checked 2026-07-22); collaboration-discussions-source-05 ([discussion category lifecycle, discussion section lifecycle, category and section invariants, announcement transfer restriction](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions), checked 2026-07-23); collaboration-discussions-source-06 ([accepted answer eligibility, marking and unmarking answers](https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions), checked 2026-07-23); collaboration-discussions-source-07 ([discussion polls, poll option minimum, answer authority](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion), checked 2026-07-23); collaboration-discussions-source-08 ([discussion create and update, discussion close and reopen, discussion deletion, accepted answer mutations, poll voting without a poll-close mutation](https://docs.github.com/en/graphql/reference/discussions), checked 2026-07-23)

### [collaboration/moderation](../../apps/web/src/modules/collaboration/moderation/README.md)

- **Owns:** ContentReport, ModerationCase, InteractionLimit, OrganizationBlock, ContentVisibilityDecision.
- **Excludes:** CommentBody, IssueState, DiscussionState.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via ModerationPermission (synchronous); collaboration/issues via IssueModerationTarget (synchronous); collaboration/conversations via ConversationModerationTarget (synchronous); collaboration/discussions via DiscussionModerationTarget (synchronous)
- **Published events:** ContentReported@1 (domain; planned; contract pending), ContentReportResolved@1 (domain; planned; contract pending), ContentReportReopened@1 (domain; planned; contract pending), InteractionLimitSet@1 (domain; planned; contract pending), InteractionLimitLifted@1 (domain; planned; contract pending), OrganizationBlocked@1 (domain; planned; contract pending), OrganizationUnblocked@1 (domain; planned; contract pending), ContentHidden@1 (domain; planned; contract pending), ContentUnhidden@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-moderation-source-01 ([content moderation, interaction limits, blocking, conversation locking](https://docs.github.com/en/communities/moderating-comments-and-conversations), unverified)

### [collaboration/projects](../../apps/web/src/modules/collaboration/projects/README.md)

- **Owns:** Project, ProjectItem, DraftIssue, ProjectView, ProjectField, ProjectWorkflow, ProjectChart, ProjectTemplate, ProjectStatusUpdate.
- **Excludes:** RepositoryOwnership, Issue, IssueFieldDefinition.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via UserProjectOwner (synchronous); organizations/organizations via OrganizationProjectOwner (synchronous); organizations/organization-policies via ProjectPolicy (synchronous); collaboration/issues via IssueProjectItem (synchronous); commerce/entitlements via ProjectEntitlement (synchronous)
- **Published events:** ProjectCreated@1 (domain; planned; contract pending), ProjectUpdated@1 (domain; planned; contract pending), ProjectClosed@1 (domain; planned; contract pending), ProjectReopened@1 (domain; planned; contract pending), ProjectDeleted@1 (domain; planned; contract pending), ProjectItemAdded@1 (domain; planned; contract pending), ProjectItemUpdated@1 (domain; planned; contract pending), ProjectItemRemoved@1 (domain; planned; contract pending), ProjectViewChanged@1 (domain; planned; contract pending), ProjectFieldChanged@1 (domain; planned; contract pending), ProjectWorkflowChanged@1 (domain; planned; contract pending), ProjectStatusUpdated@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** collaboration-projects-source-01 ([projects, views, fields, workflows, charts, templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects), unverified)

### [engagement/stars](../../apps/web/src/modules/engagement/stars/README.md)

- **Owns:** RepositoryStar, StarList, StarListEntry.
- **Excludes:** RepositorySubscription, Notification, UserFollow.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryStarrableOperationalState (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous); repositories/repositories via RepositoryVisibilityEvents (event) [RepositoryVisibilityChanged@1]
- **Published events:** RepositoryStarred@1 (domain; planned; contract pending), RepositoryUnstarred@1 (domain; planned; contract pending), StarListCreated@1 (domain; planned; contract pending), StarListUpdated@1 (domain; planned; contract pending), StarListDeleted@1 (domain; planned; contract pending), StarListEntryAdded@1 (domain; planned; contract pending), StarListEntryRemoved@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** engagement-stars-source-01 ([repository stars, star lists, discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars), checked 2026-07-22); engagement-stars-source-02 ([stars removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22); engagement-stars-source-03 ([starring archived repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories), checked 2026-07-22)

### [engagement/subscriptions](../../apps/web/src/modules/engagement/subscriptions/README.md)

- **Owns:** RepositoryWatchPreference, RepositoryEventPreference, ConversationParticipation, ManualConversationSubscription, IgnorePreference.
- **Excludes:** Notification, NotificationReason, EmailDelivery, RepositoryStar.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryReference (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous); collaboration/conversations via ConversationReference (synchronous); repositories/repositories via RepositoryVisibilityEvents (event) [RepositoryVisibilityChanged@1]
- **Published events:** RepositorySubscriptionChanged@1 (domain; planned; contract pending), ConversationSubscriptionChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** engagement-subscriptions-source-01 ([repository watches, conversation subscriptions, automatic participation](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), checked 2026-07-22); engagement-subscriptions-source-02 ([custom watch preferences, ignore preference](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications), checked 2026-07-22); engagement-subscriptions-source-03 ([watchers removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22)

### [engagement/notifications](../../apps/web/src/modules/engagement/notifications/README.md)

- **Owns:** Notification, NotificationInbox, NotificationReason, NotificationState, InboxFilter.
- **Excludes:** SubscriptionPreference, EmailDelivery, PushDelivery.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via NotificationRecipient (synchronous); engagement/subscriptions via NotificationInterestDecision (synchronous); repositories/repository-access via EffectiveReadPermission (synchronous); collaboration/issues via IssueNotificationEvents (event) [IssueCreated@1, IssueUpdated@1, IssueAssigned@1, IssueUnassigned@1, IssueClosed@1, IssueReopened@1]; collaboration/conversations via ConversationNotificationEvents (event) [CommentAdded@1, ReplyAdded@1, MentionDetected@1]; collaboration/discussions via DiscussionNotificationEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionAnswerMarked@1]; repositories/repository-access via RepositoryInvitationEvents (event) [RepositoryInvitationCreated@1]
- **Published events:** NotificationCreated@1 (domain; planned; contract pending), NotificationRead@1 (domain; planned; contract pending), NotificationUnread@1 (domain; planned; contract pending), NotificationSaved@1 (domain; planned; contract pending), NotificationUnsaved@1 (domain; planned; contract pending), NotificationDone@1 (domain; planned; contract pending), NotificationReopened@1 (domain; planned; contract pending), InboxFilterChanged@1 (domain; planned; contract pending), NotificationDeliveryRequested@1 (integration; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** engagement-notifications-source-01 ([notifications, recipient interest, notification retention](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), checked 2026-07-22); engagement-notifications-source-02 ([notification reasons, inbox filters, notification state](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters), checked 2026-07-22)

### [integrations/github-app-registrations](../../apps/web/src/modules/integrations/github-app-registrations/README.md)

- **Owns:** GitHubAppRegistration, GitHubAppOwnerReference, GitHubAppPermissionRequest, GitHubAppWebhookPreference, RequestedWebhookEvents, WebhookActivationState.
- **Excludes:** AppInstallation, UserAuthorization, WebhookDelivery.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via UserAppOwner (synchronous); organizations/organizations via OrganizationAppOwner (synchronous); enterprises/enterprises via EnterpriseAppOwner (synchronous); commerce/entitlements via AppEntitlement (synchronous)
- **Published events:** GitHubAppRegistered@1 (domain; planned; contract pending), GitHubAppUpdated@1 (domain; planned; contract pending), GitHubAppDeleted@1 (domain; planned; contract pending), GitHubAppPermissionsChanged@1 (domain; planned; contract pending), GitHubAppWebhookConfigurationChanged@1 (domain; planned; contract pending), GitHubAppOwnershipTransferred@1 (domain; planned; contract pending)
- **Semantic claims:** github-app-registration (owns GitHubAppRegistration, GitHubAppOwnerReference, GitHubAppPermissionRequest; events GitHubAppRegistered@1; sources integrations-github-app-registrations-source-01); github-app-registration-update (owns GitHubAppWebhookPreference, RequestedWebhookEvents, WebhookActivationState; events GitHubAppUpdated@1, GitHubAppPermissionsChanged@1, GitHubAppWebhookConfigurationChanged@1; sources integrations-github-app-registrations-source-03); github-app-ownership-transfer (no ownership entries; events GitHubAppOwnershipTransferred@1; sources integrations-github-app-registrations-source-02); github-app-registration-deletion (no ownership entries; events GitHubAppDeleted@1; sources integrations-github-app-registrations-source-04)
- **Official sources:** integrations-github-app-registrations-source-01 ([app registration, app ownership, app permissions, app visibility](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app), checked 2026-07-22); integrations-github-app-registrations-source-02 ([GitHub App registration ownership transfer, eligible destination account types, transfer effects](https://docs.github.com/en/apps/maintaining-github-apps/transferring-ownership-of-a-github-app), checked 2026-07-22); integrations-github-app-registrations-source-03 ([GitHub App registration updates, permission changes, webhook configuration changes](https://docs.github.com/en/apps/maintaining-github-apps/modifying-a-github-app-registration), checked 2026-07-22); integrations-github-app-registrations-source-04 ([GitHub App registration deletion, installation removal after registration deletion](https://docs.github.com/en/apps/maintaining-github-apps/deleting-a-github-app), checked 2026-07-22)

### [integrations/github-app-installations](../../apps/web/src/modules/integrations/github-app-installations/README.md)

- **Owns:** AppInstallation, InstallationTargetReference, InstallationRepositorySelection, InstallationPermissionGrant.
- **Excludes:** AppRegistration, OAuthAuthorization, RepositoryGrant.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** integrations/github-app-registrations via GitHubAppRegistrationReference (synchronous); integrations/github-app-registrations via GitHubAppRegistrationLifecycleEvents (event) [GitHubAppDeleted@1]; identity/accounts via UserInstallationTarget (synchronous); organizations/organizations via OrganizationInstallationTarget (synchronous); repositories/repositories via InstallationRepositoryReference (synchronous); repositories/repository-access via InstallationPermission (synchronous)
- **Published events:** GitHubAppInstalled@1 (domain; planned; contract pending), GitHubAppInstallationSuspended@1 (domain; planned; contract pending), GitHubAppInstallationUnsuspended@1 (domain; planned; contract pending), GitHubAppUninstalled@1 (domain; planned; contract pending), GitHubAppInstallationRepositorySelectionChanged@1 (domain; planned; contract pending), GitHubAppInstallationPermissionsChanged@1 (domain; planned; contract pending)
- **Semantic claims:** github-app-installation (owns AppInstallation, InstallationTargetReference, InstallationRepositorySelection, InstallationPermissionGrant; events GitHubAppInstalled@1; sources integrations-github-app-installations-source-01); github-app-installation-permission-approval (no ownership entries; events GitHubAppInstallationPermissionsChanged@1; sources integrations-github-app-installations-source-04); github-app-installation-suspension (no ownership entries; events GitHubAppInstallationSuspended@1, GitHubAppInstallationUnsuspended@1; sources integrations-github-app-installations-source-02); github-app-installation-selection-and-removal (no ownership entries; events GitHubAppUninstalled@1, GitHubAppInstallationRepositorySelectionChanged@1; sources integrations-github-app-installations-source-03)
- **Official sources:** integrations-github-app-installations-source-01 ([app installation, installation targets, repository selection, installation lifecycle](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app), checked 2026-07-22); integrations-github-app-installations-source-02 ([installation suspension, installation unsuspension, suspending actor authority](https://docs.github.com/en/apps/maintaining-github-apps/suspending-a-github-app-installation), checked 2026-07-22); integrations-github-app-installations-source-03 ([installation repository selection, installation suspension by target owner, installation uninstall](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps), checked 2026-07-22); integrations-github-app-installations-source-04 ([additional installation permission requests, installation-owner permission approval, retaining existing permissions without approval](https://docs.github.com/en/apps/using-github-apps/approving-updated-permissions-for-a-github-app), checked 2026-07-23)

### [integrations/oauth-app-registrations](../../apps/web/src/modules/integrations/oauth-app-registrations/README.md)

- **Owns:** OAuthClient, OAuthAppOwnerReference, OAuthCallbackConfiguration.
- **Excludes:** OAuthAuthorization, GitHubAppRegistration, TokenStorageAdapter.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via UserOAuthAppOwner (synchronous); organizations/organizations via OrganizationOAuthAppOwner (synchronous)
- **Published events:** OAuthClientRegistered@1 (domain; planned; contract pending), OAuthClientUpdated@1 (domain; planned; contract pending), OAuthClientDeleted@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** integrations-oauth-app-registrations-source-01 ([OAuth App registration, OAuth client ownership, callback configuration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), checked 2026-07-22)

### [integrations/oauth-authorizations](../../apps/web/src/modules/integrations/oauth-authorizations/README.md)

- **Owns:** OAuthAuthorization, AuthorizationScope, AuthorizationRevocation.
- **Excludes:** GitHubAppInstallation, InteractiveSession, TokenStorageAdapter.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** integrations/oauth-app-registrations via OAuthClientReference (synchronous); identity/accounts via AuthorizingUserReference (synchronous); organizations/organization-policies via OAuthPolicyConstraints (synchronous)
- **Published events:** OAuthAuthorizationGranted@1 (domain; planned; contract pending), OAuthAuthorizationRevoked@1 (domain; planned; contract pending), OAuthScopesChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** integrations-oauth-authorizations-source-01 ([OAuth App user authorization, OAuth scopes, authorization revocation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), checked 2026-07-22)

### [integrations/repository-autolinks](../../apps/web/src/modules/integrations/repository-autolinks/README.md)

- **Owns:** RepositoryAutolink, AutolinkPrefix, AutolinkIdentifierFormat, AutolinkTargetTemplate.
- **Excludes:** ExternalResource, RepositoryContent, ContentRendering.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryLifecycleState (synchronous); repositories/repository-access via RepositoryAdministrationPermission (synchronous); commerce/entitlements via RepositoryAutolinkEntitlement (synchronous)
- **Published events:** RepositoryAutolinkCreated@1 (domain; planned; contract pending), RepositoryAutolinkDeleted@1 (domain; planned; contract pending)
- **Semantic claims:** repository-autolink-definition (owns RepositoryAutolink, AutolinkPrefix, AutolinkIdentifierFormat, AutolinkTargetTemplate; events RepositoryAutolinkCreated@1; sources integrations-repository-autolinks-source-01, integrations-repository-autolinks-source-02); repository-autolink-deletion (no ownership entries; events RepositoryAutolinkDeleted@1; sources integrations-repository-autolinks-source-02)
- **Official sources:** integrations-repository-autolinks-source-01 ([repository autolinks, non-overlapping prefixes, identifier formats, target template](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-autolinks-to-reference-external-resources), checked 2026-07-23); integrations-repository-autolinks-source-02 ([autolink list and read, autolink creation, autolink deletion, identifier format, target template](https://docs.github.com/en/rest/repos/autolinks), checked 2026-07-23)

### [integrations/webhooks](../../apps/web/src/modules/integrations/webhooks/README.md)

- **Owns:** Webhook, WebhookEventSelection, WebhookSecretReference, GitHubAppWebhookEndpointProjection, WebhookDelivery, WebhookDeliveryAttempt.
- **Excludes:** DomainEvent, ArbitraryDatabasePolling, RawSecretStorage.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** integrations/github-app-registrations via GitHubAppWebhookConfigurationEvents (event) [GitHubAppWebhookConfigurationChanged@1]; integrations/github-app-installations via InstallationWebhookScope (synchronous); repositories/repositories via RepositoryWebhookTargetAndOperationalState (synchronous); organizations/organizations via OrganizationWebhookTarget (synchronous); enterprises/enterprises via EnterpriseWebhookTarget (synchronous); organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; repositories/repositories via PublishedEventContract (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1, RepositoryTransferred@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1]; collaboration/issues via PublishedEventContract (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via PublishedEventContract (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via PublishedEventContract (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1]; engagement/stars via PublishedEventContract (event) [RepositoryStarred@1, RepositoryUnstarred@1]; integrations/github-app-installations via PublishedEventContract (event) [GitHubAppInstalled@1, GitHubAppInstallationSuspended@1, GitHubAppInstallationUnsuspended@1, GitHubAppUninstalled@1]
- **Published events:** WebhookCreated@1 (domain; planned; contract pending), WebhookUpdated@1 (domain; planned; contract pending), WebhookDeleted@1 (domain; planned; contract pending), WebhookDeliveryQueued@1 (domain; planned; contract pending), WebhookDeliverySucceeded@1 (domain; planned; contract pending), WebhookDeliveryFailed@1 (domain; planned; contract pending), WebhookRedelivered@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** integrations-webhooks-source-01 ([webhook events, payloads, webhook types](https://docs.github.com/en/webhooks/webhook-events-and-payloads), checked 2026-07-22); integrations-webhooks-source-02 ([deliveries, attempts, redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries), checked 2026-07-22); integrations-webhooks-source-03 ([GitHub App webhook projection, GitHub App webhook delivery configuration](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps), checked 2026-07-22)

### [commerce/billing](../../apps/web/src/modules/commerce/billing/README.md)

- **Owns:** BillingAccount, PaymentProfile, UsageRecord, Budget, CostCenter, Invoice.
- **Excludes:** FeatureEntitlement, LicenseAssignment, PaymentProviderRecord.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via PersonalBillingOwner (synchronous); organizations/organizations via OrganizationBillingOwner (synchronous); enterprises/enterprises via EnterpriseBillingOwner (synchronous)
- **Published events:** BillingAccountCreated@1 (domain; planned; contract pending), BillingAccountUpdated@1 (domain; planned; contract pending), PaymentProfileUpdated@1 (domain; planned; contract pending), UsageRecorded@1 (domain; planned; contract pending), BudgetCreated@1 (domain; planned; contract pending), BudgetUpdated@1 (domain; planned; contract pending), BudgetExceeded@1 (domain; planned; contract pending), CostCenterCreated@1 (domain; planned; contract pending), CostCenterUpdated@1 (domain; planned; contract pending), CostCenterDeleted@1 (domain; planned; contract pending), InvoiceIssued@1 (domain; planned; contract pending), InvoicePaid@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** commerce-billing-source-01 ([billing accounts, usage, budgets, cost centers](https://docs.github.com/en/billing/get-started/introduction-to-billing), unverified)

### [commerce/entitlements](../../apps/web/src/modules/commerce/entitlements/README.md)

- **Owns:** Plan, FeatureEntitlement, License, LicenseAssignment, UsageLimit.
- **Excludes:** Invoice, OrganizationMembership, EnterpriseRole.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** commerce/billing via BillingStanding (synchronous); identity/accounts via UserEntitlementOwner (synchronous); organizations/organizations via OrganizationEntitlementOwner (synchronous); enterprises/enterprises via EnterpriseEntitlementOwner (synchronous)
- **Published events:** PlanChanged@1 (domain; planned; contract pending), EntitlementGranted@1 (domain; planned; contract pending), EntitlementRevoked@1 (domain; planned; contract pending), LicenseAssigned@1 (domain; planned; contract pending), LicenseRevoked@1 (domain; planned; contract pending), UsageLimitReached@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** commerce-entitlements-source-01 ([plans, licenses, license assignment, usage limits](https://docs.github.com/en/billing/how-tos/manage-plan-and-licenses), unverified)

### [governance/audit-logs](../../apps/web/src/modules/governance/audit-logs/README.md)

- **Owns:** AuditEvent, AuditScope, AuditActor, AuditTarget, AuditExport, AuditRetentionPolicy.
- **Excludes:** ProductActivityFeed, StorageRecord, ArbitraryApplicationLog.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** organizations/organizations via OrganizationAuditScope (synchronous); enterprises/enterprises via EnterpriseAuditScope (synchronous); platform/audit-storage via AuditStoragePort (synchronous); identity/accounts via PublishedEventContract (event) [AccountDeleted@1]; enterprises/enterprise-memberships via PublishedEventContract (event) [EnterpriseMemberAdded@1, EnterpriseMemberRemoved@1, EnterpriseAffiliationChanged@1]; enterprises/enterprise-roles via PublishedEventContract (event) [EnterpriseRoleDefined@1, EnterpriseRoleUpdated@1, EnterpriseRoleDeleted@1, EnterpriseRoleAssigned@1, EnterpriseRoleRevoked@1]; enterprises/enterprise-iam via PublishedEventContract (event) [IdentityProviderConfigured@1, ProvisionedIdentityCreated@1, ProvisionedIdentitySuspended@1, ProvisionedIdentityReinstated@1, ProvisionedIdentityDeprovisioned@1]; enterprises/enterprise-policies via PublishedEventContract (event) [EnterprisePolicyChanged@1, EnterprisePolicyEnforcementChanged@1, OrganizationPolicyOverrideChanged@1]; organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; organizations/organization-teams via PublishedEventContract (event) [OrganizationTeamCreated@1, OrganizationTeamUpdated@1, OrganizationTeamDeleted@1, TeamMemberAdded@1, TeamMemberRemoved@1, TeamMaintainerChanged@1]; organizations/organization-roles via PublishedEventContract (event) [OrganizationRoleDefined@1, OrganizationRoleUpdated@1, OrganizationRoleDeleted@1, OrganizationRoleAssigned@1, OrganizationRoleRevoked@1, CustomRepositoryRoleDefined@1, CustomRepositoryRoleUpdated@1, CustomRepositoryRoleDeleted@1]; organizations/organization-policies via PublishedEventContract (event) [OrganizationPolicyChanged@1, BaseRepositoryPermissionChanged@1]; enterprises/custom-properties via PublishedEventContract (event) [EnterpriseRepositoryPropertyDefined@1, EnterpriseRepositoryPropertyUpdated@1, EnterpriseRepositoryPropertyDeleted@1, EnterpriseRepositoryPropertyPromoted@1, EnterpriseOrganizationPropertyDefined@1, EnterpriseOrganizationPropertyUpdated@1, EnterpriseOrganizationPropertyDeleted@1, OrganizationPropertyValueSet@1, OrganizationPropertyValueCleared@1]; organizations/custom-properties via PublishedEventContract (event) [OrganizationRepositoryPropertyDefined@1, OrganizationRepositoryPropertyUpdated@1, OrganizationRepositoryPropertyDeleted@1, OrganizationRepositoryPropertyPromotionRequested@1, RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1]; repositories/repositories via PublishedEventContract (event) [RepositoryVisibilityChanged@1, RepositoryTransferred@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1, OutsideCollaboratorAccessGranted@1, OutsideCollaboratorAccessRevoked@1]; integrations/github-app-registrations via PublishedEventContract (event) [GitHubAppRegistered@1, GitHubAppUpdated@1, GitHubAppDeleted@1, GitHubAppPermissionsChanged@1, GitHubAppOwnershipTransferred@1]; integrations/github-app-installations via PublishedEventContract (event) [GitHubAppInstalled@1, GitHubAppInstallationSuspended@1, GitHubAppInstallationUnsuspended@1, GitHubAppUninstalled@1, GitHubAppInstallationPermissionsChanged@1]; integrations/oauth-app-registrations via OAuthClientAuditEvents (event) [OAuthClientRegistered@1, OAuthClientUpdated@1, OAuthClientDeleted@1]; integrations/oauth-authorizations via PublishedEventContract (event) [OAuthAuthorizationGranted@1, OAuthAuthorizationRevoked@1, OAuthScopesChanged@1]; integrations/webhooks via PublishedEventContract (event) [WebhookCreated@1, WebhookUpdated@1, WebhookDeleted@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; commerce/billing via PublishedEventContract (event) [BillingAccountUpdated@1, PaymentProfileUpdated@1, BudgetCreated@1, BudgetUpdated@1, BudgetExceeded@1, CostCenterCreated@1, CostCenterUpdated@1, CostCenterDeleted@1]; commerce/entitlements via PublishedEventContract (event) [PlanChanged@1, EntitlementGranted@1, EntitlementRevoked@1, LicenseAssigned@1, LicenseRevoked@1, UsageLimitReached@1]
- **Published events:** AuditEventRecorded@1 (domain; planned; contract pending), AuditExportRequested@1 (domain; planned; contract pending), AuditExportCompleted@1 (domain; planned; contract pending), AuditExportFailed@1 (domain; planned; contract pending), AuditRetentionPolicyChanged@1 (domain; planned; contract pending)
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** governance-audit-logs-source-01 ([enterprise audit log, audit search, audit export, audit streaming](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise), unverified)

### [projections/search](../../apps/web/src/modules/projections/search/README.md)

- **Owns:** SearchDocument, SearchResultProjection.
- **Excludes:** SourceAggregate, AuthorizationSourceOfTruth, CodeSearch.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/accounts via AccountSearchEvents (event) [AccountCreated@1, UsernameChanged@1, AccountDeleted@1]; organizations/organizations via OrganizationSearchEvents (event) [OrganizationCreated@1, OrganizationRenamed@1, OrganizationLifecycleChanged@1]; enterprises/custom-properties via EnterpriseCustomPropertySearchEvents (event) [EnterpriseRepositoryPropertyDefined@1, EnterpriseRepositoryPropertyUpdated@1, EnterpriseRepositoryPropertyDeleted@1, EnterpriseRepositoryPropertyPromoted@1, EnterpriseOrganizationPropertyDefined@1, EnterpriseOrganizationPropertyUpdated@1, EnterpriseOrganizationPropertyDeleted@1, OrganizationPropertyValueSet@1, OrganizationPropertyValueCleared@1]; organizations/custom-properties via RepositoryCustomPropertySearchEvents (event) [OrganizationRepositoryPropertyDefined@1, OrganizationRepositoryPropertyUpdated@1, OrganizationRepositoryPropertyDeleted@1, RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1]; repositories/repositories via RepositorySearchEvents (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via EffectiveReadPermission (synchronous); collaboration/issues via IssueSearchEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1, IssueTransferred@1]; collaboration/discussions via DiscussionSearchEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1, DiscussionTransferred@1]; collaboration/projects via ProjectSearchEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectDeleted@1]; platform/search-index via SearchIndexPort (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** projections-search-source-01 ([global search, repository search, issue search, permission-filtered results](https://docs.github.com/en/search-github), unverified)

### [projections/dashboard](../../apps/web/src/modules/projections/dashboard/README.md)

- **Owns:** AvailableDashboardContext, SelectedDashboardContext, DashboardRepositoryView.
- **Excludes:** AuthenticationSession, OrganizationMembership, RepositoryGrant, EnterpriseDashboardContext.
- **Activation scope:** get-dashboard-repository-view, get-selected-dashboard-context, list-available-dashboard-contexts, restore-last-valid-dashboard-context, select-dashboard-context
- **Runtime dependencies:** identity/accounts via AccountReference (synchronous); identity/authentication via AuthenticatedSessionReference (synchronous); organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMembershipReference (synchronous); repositories/repositories via RepositoryCandidateReference (synchronous); repositories/repository-access via EffectiveRepositoryPermissionDecision (synchronous)
- **Planned relationships:** None.
- **Published events:** None. The Dashboard is a read-model projection and does not publish product facts.
- **Semantic claims:** dashboard-context-selection (owns AvailableDashboardContext, SelectedDashboardContext; no events; sources projections-dashboard-source-01, projections-dashboard-source-02); dashboard-repository-projection (owns DashboardRepositoryView; no events; sources projections-dashboard-source-01, projections-dashboard-source-02)
- **Official sources:** projections-dashboard-source-01 ([personal dashboard, personal repository view](https://docs.github.com/en/account-and-profile/concepts/personal-dashboard), checked 2026-07-23); projections-dashboard-source-02 ([personal and organization dashboard selection, organization dashboard repository view](https://docs.github.com/en/enterprise-cloud@latest/organizations/collaborating-with-groups-in-organizations/about-your-organization-dashboard), checked 2026-07-23)

### [projections/activity-feed](../../apps/web/src/modules/projections/activity-feed/README.md)

- **Owns:** ActivityItem, PersonalActivityFeed, RepositoryActivityFeed, OrganizationActivityFeed.
- **Excludes:** AuditEvent, DomainEventSource, CodeActivity.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** identity/social-graph via FollowEvents (event) [UserFollowed@1, UserUnfollowed@1, OrganizationFollowed@1, OrganizationUnfollowed@1]; repositories/repositories via RepositoryActivityEvents (event) [RepositoryCreated@1, RepositoryProfileUpdated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1]; collaboration/issues via IssueActivityEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionActivityEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via ProjectActivityEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectStatusUpdated@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** projections-activity-feed-source-01 ([personal dashboard, activity feed, followed activity](https://docs.github.com/en/account-and-profile/concepts/personal-dashboard), unverified)

### [projections/repository-insights](../../apps/web/src/modules/projections/repository-insights/README.md)

- **Owns:** RepositoryInsight, EngagementMetric, IntegrationHealthMetric.
- **Excludes:** GitActivityMetric, ContributorCodeMetric, SourceAggregate, RepositoryTrafficMetric.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** repositories/repositories via RepositoryInsightEvents (event) [RepositoryCreated@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1]; collaboration/issues via IssueMetricEvents (event) [IssueCreated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionMetricEvents (event) [DiscussionCreated@1, DiscussionClosed@1, DiscussionReopened@1]; engagement/stars via StarMetricEvents (event) [RepositoryStarred@1, RepositoryUnstarred@1]; engagement/subscriptions via SubscriptionMetricEvents (event) [RepositorySubscriptionChanged@1, ConversationSubscriptionChanged@1]; integrations/webhooks via WebhookHealthEvents (event) [WebhookDeliverySucceeded@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Semantic claims:** None while product semantics remain candidate.
- **Official sources:** projections-repository-insights-source-01 ([repository engagement insights, repository graph availability](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/about-repository-graphs), checked 2026-07-22)

### [platform/event-publication](../../apps/web/src/modules/platform/event-publication/README.md)

- **Owns:** PublicationLease, PublicationCursor, PublicationAttempt, DeadLetterRecord, RedeliveryRequest.
- **Excludes:** ProductEventMeaning, ContextOutboxRecord, SourceContextTransaction, WebhookSubscription, NotificationInterest.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** IntegrationEventPublished@1 (technical; planned; contract pending), EventPublicationFailed@1 (technical; planned; contract pending), EventDeadLettered@1 (technical; planned; contract pending), EventRedelivered@1 (technical; planned; contract pending)
- **Semantic claims:** Not applicable to technical capabilities.
- **Official sources:** Not applicable; technical capability.

### [platform/search-index](../../apps/web/src/modules/platform/search-index/README.md)

- **Owns:** IndexDocument, IndexCursor, IndexOperation.
- **Excludes:** SearchSemantics, AuthorizationDecision, SourceAggregate.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** SearchDocumentUpserted@1 (technical; planned; contract pending), SearchDocumentRemoved@1 (technical; planned; contract pending), SearchIndexRebuilt@1 (technical; planned; contract pending)
- **Semantic claims:** Not applicable to technical capabilities.
- **Official sources:** Not applicable; technical capability.

### [platform/media-storage](../../apps/web/src/modules/platform/media-storage/README.md)

- **Owns:** MediaReference, MediaObject, MediaStoragePolicy.
- **Excludes:** RepositoryContent, ReleaseAsset, ProductVisibilityRule.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** MediaStored@1 (technical; planned; contract pending), MediaDeleted@1 (technical; planned; contract pending), MediaQuarantined@1 (technical; planned; contract pending)
- **Semantic claims:** Not applicable to technical capabilities.
- **Official sources:** Not applicable; technical capability.

### [platform/notification-channels](../../apps/web/src/modules/platform/notification-channels/README.md)

- **Owns:** ChannelDelivery, DeliveryAttempt, DeliveryProviderReference.
- **Excludes:** Notification, SubscriptionPreference, RecipientSelection.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** engagement/notifications via NotificationDeliveryRequests (event) [NotificationDeliveryRequested@1]
- **Published events:** ChannelDeliverySucceeded@1 (technical; planned; contract pending), ChannelDeliveryFailed@1 (technical; planned; contract pending)
- **Semantic claims:** Not applicable to technical capabilities.
- **Official sources:** Not applicable; technical capability.

### [platform/audit-storage](../../apps/web/src/modules/platform/audit-storage/README.md)

- **Owns:** AuditStorageRecord, AuditExportJob, RetentionExecution.
- **Excludes:** AuditEventMeaning, AuditAuthorization, ProductActivityFeed.
- **Activation scope:** None while planned.
- **Runtime dependencies:** None.
- **Planned relationships:** None.
- **Published events:** AuditRecordStored@1 (technical; planned; contract pending), AuditStorageExportCompleted@1 (technical; planned; contract pending), AuditRetentionApplied@1 (technical; planned; contract pending)
- **Semantic claims:** Not applicable to technical capabilities.
- **Official sources:** Not applicable; technical capability.

All product semantics are justified by HTTPS sources under docs.github.com/en/.
Planned context directories contain README.md only and have no activation scope, runtime dependencies, or source code until implementation begins.
