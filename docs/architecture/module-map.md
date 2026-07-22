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

## Bounded contexts

| Subdomain | Bounded context | Kind | Classification | Maturity | Implementation | Source freshness | Semantic status | Responsibility |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| identity | accounts | domain | core | stable | planned | unverified | candidate | Personal, managed, setup, and bot account identity and lifecycle. |
| identity | authentication | domain | core | stable | planned | unverified | candidate | Credentials, sessions, two-factor authentication, recovery, and external login binding. |
| identity | profiles | domain | supporting | stable | planned | unverified | candidate | Public and private personal profiles, profile status, and pinned-item presentation. |
| identity | social-graph | domain | supporting | stable | planned | unverified | candidate | Following relationships between users and organizations. |
| enterprises | enterprises | domain | core | stable | planned | unverified | candidate | Enterprise identity, profile, account mode, lifecycle, and organization ownership. |
| enterprises | enterprise-memberships | domain | core | stable | planned | unverified | candidate | Enterprise membership, invitations, affiliation, guest collaborators, and unaffiliated users. |
| enterprises | enterprise-teams | domain | supporting | preview | planned | unverified | candidate | Enterprise-wide teams used for centralized role, organization, and license assignment. |
| enterprises | enterprise-roles | domain | core | stable | planned | unverified | candidate | Predefined and custom enterprise roles, permissions, and assignments. |
| enterprises | enterprise-iam | domain | core | stable | planned | unverified | candidate | Enterprise identity-provider configuration, SAML or OIDC authentication, SCIM provisioning, and group synchronization. |
| enterprises | enterprise-policies | domain | core | stable | planned | unverified | candidate | Enterprise policy constraints applied across owned organizations and repositories. |
| enterprises | custom-properties | domain | supporting | stable | planned | fresh | validated | Enterprise-defined repository and organization custom-property schemas, organization values, and promotion of organization repository properties. |
| organizations | organizations | domain | core | stable | planned | unverified | candidate | Organization identity, profile, lifecycle, verified domains, and enterprise ownership. |
| organizations | organization-memberships | domain | core | stable | planned | unverified | candidate | Organization membership, invitations, member roles, and membership lifecycle. |
| organizations | organization-teams | domain | core | stable | planned | unverified | candidate | Organization teams, nested hierarchy, visibility, membership, maintainers, and mentions. |
| organizations | organization-roles | domain | supporting | stable | planned | unverified | candidate | Predefined and custom organization roles and custom repository-role definitions. |
| organizations | organization-policies | domain | core | stable | planned | unverified | candidate | Organization policies for repositories, collaborators, projects, discussions, and member privileges. |
| organizations | custom-properties | domain | supporting | stable | planned | fresh | validated | Organization-defined repository custom-property schemas and repository property values from organization or enterprise definitions. |
| repositories | repositories | domain | core | stable | planned | fresh | validated | Repository identity, personal or organization ownership, name, description, homepage, visibility, lifecycle, redirects, and transfer. |
| repositories | repository-access | domain | core | stable | planned | fresh | validated | Repository invitations, direct and inherited grants, outside collaborators, role assignments, and source-attributed effective permission resolution. |
| repositories | repository-features | domain | supporting | stable | planned | fresh | validated | Repository Issues, Discussions, and Projects enablement with feature-specific configuration. |
| repositories | repository-metadata | domain | supporting | stable | planned | fresh | candidate | Repository topics and social-media preview configuration. |
| collaboration | issues | domain | core | stable | planned | fresh | candidate | Issue lifecycle, assignment, hierarchy, dependency, transfer, and work tracking. |
| collaboration | issue-schema | domain | supporting | stable | planned | fresh | candidate | Organization-level issue type and field definitions, visibility, pinning, and type-field associations. |
| collaboration | labels-and-milestones | domain | supporting | stable | planned | unverified | candidate | Repository-scoped labels, milestones, and work classification. |
| collaboration | conversations | domain | supporting | stable | planned | fresh | candidate | Capability-constrained comments, discussion replies, reactions, mentions, revisions, and locks for a closed set of subjects. |
| collaboration | discussions | domain | core | stable | planned | fresh | validated | Repository discussion forums and organization discussion spaces, source-repository binding, categories, sections, polls, answers, pins, and lifecycle. |
| collaboration | moderation | domain | supporting | stable | planned | unverified | candidate | Content reports, moderation cases, blocks, interaction limits, and visibility decisions. |
| collaboration | projects | domain | core | stable | planned | unverified | candidate | User- or organization-owned projects, items, draft issues, views, fields, workflows, charts, templates, and status updates. |
| engagement | stars | domain | supporting | stable | planned | fresh | candidate | Repository starring and user-defined star lists for discovery and collection. |
| engagement | subscriptions | domain | supporting | stable | planned | fresh | candidate | Repository watch preferences, conversation participation and manual subscriptions, ignore preferences, and notification-interest decisions. |
| engagement | notifications | domain | supporting | stable | planned | fresh | candidate | User notification records, inboxes, reasons, filters, and read, saved, or done state. |
| integrations | github-app-registrations | domain | supporting | stable | planned | fresh | validated | GitHub App registration, ownership and ownership transfer, requested permissions, webhook preference, requested webhook events, and visibility. |
| integrations | github-app-installations | domain | supporting | stable | planned | fresh | validated | GitHub App installation targets, selected repositories, granted permissions, suspension, and uninstall lifecycle. |
| integrations | oauth-app-registrations | domain | supporting | stable | planned | fresh | candidate | OAuth App registration, ownership, callback configuration, and client lifecycle. |
| integrations | oauth-authorizations | domain | supporting | stable | planned | fresh | candidate | User authorization of registered OAuth Apps, scopes, approval, and revocation. |
| integrations | repository-autolinks | domain | supporting | stable | planned | fresh | candidate | Repository-scoped autolink definitions for external resource references. |
| integrations | webhooks | domain | supporting | stable | planned | fresh | candidate | Repository, organization, and enterprise webhook configuration plus GitHub App webhook projections, deliveries, attempts, and redelivery. |
| commerce | billing | domain | supporting | stable | planned | unverified | candidate | Billing accounts, payment profiles, usage, budgets, cost centers, invoices, and spending allocation. |
| commerce | entitlements | domain | supporting | stable | planned | unverified | candidate | Plans, feature entitlements, licenses, assignments, and usage limits. |
| governance | audit-logs | domain | supporting | stable | planned | unverified | candidate | Organization and enterprise audit events, scopes, actors, targets, search, export, streaming, and retention policy. |
| projections | search | projection | — | stable | planned | unverified | candidate | Permission-filtered search projections across users, organizations, repositories, issues, discussions, and projects. |
| projections | activity-feed | projection | — | stable | planned | unverified | candidate | User-visible dashboard and resource activity projections. |
| projections | repository-insights | projection | — | stable | planned | fresh | candidate | Non-code repository engagement trends and integration-health projections. |
| platform | event-publication | technical | — | stable | planned | not-applicable | not-applicable | Dispatch, leasing, retry, operational idempotency, redelivery, and dead-letter handling for context-owned event envelopes. |
| platform | search-index | technical | — | stable | planned | not-applicable | not-applicable | Search document indexing, querying, and index lifecycle adapters. |
| platform | media-storage | technical | — | stable | planned | not-applicable | not-applicable | Storage and retrieval of media referenced by product domains. |
| platform | notification-channels | technical | — | stable | planned | not-applicable | not-applicable | External email or push delivery adapters for accepted notification delivery requests. |
| platform | audit-storage | technical | — | stable | planned | not-applicable | not-applicable | Durable storage, export, and retention enforcement for audit records. |

## Ownership and relationships

### identity/accounts

- **Owns:** Account, Username, AccountLifecycle, GhostAttribution.
- **Excludes:** Credential, Session, Profile, EnterpriseMembership.
- **Dependencies:** None.
- **Published events:** AccountCreated@1 (domain; contract pending), UsernameChanged@1 (domain; contract pending), AccountSuspended@1 (domain; contract pending), AccountReinstated@1 (domain; contract pending), AccountDeleted@1 (domain; contract pending)
- **Official sources:** identity-accounts-source-01 ([personal accounts, managed accounts, account lifecycle](https://docs.github.com/en/account-and-profile/concepts/account-management), unverified)

### identity/authentication

- **Owns:** Credential, Session, TwoFactorConfiguration, ExternalLoginBinding.
- **Excludes:** AccountLifecycle, ScimProvisioning, OAuthAppAuthorization.
- **Dependencies:** identity/accounts via AccountReference (synchronous)
- **Published events:** SessionCreated@1 (domain; contract pending), SessionRevoked@1 (domain; contract pending), TwoFactorEnabled@1 (domain; contract pending), TwoFactorDisabled@1 (domain; contract pending), ExternalLoginLinked@1 (domain; contract pending), ExternalLoginUnlinked@1 (domain; contract pending)
- **Official sources:** identity-authentication-source-01 ([authentication, sessions, two-factor authentication](https://docs.github.com/en/authentication), unverified)

### identity/profiles

- **Owns:** UserProfile, ProfileVisibility, ProfileStatus, PinnedItemSet.
- **Excludes:** AccountLifecycle, RepositoryStar, Project.
- **Dependencies:** identity/accounts via AccountReference (synchronous)
- **Published events:** ProfileUpdated@1 (domain; contract pending), ProfileVisibilityChanged@1 (domain; contract pending), ProfileStatusChanged@1 (domain; contract pending), PinnedItemsChanged@1 (domain; contract pending)
- **Official sources:** identity-profiles-source-01 ([profile, profile visibility, pinned items](https://docs.github.com/en/account-and-profile/concepts/personal-profile), unverified)

### identity/social-graph

- **Owns:** UserFollow, OrganizationFollow.
- **Excludes:** RepositoryStar, RepositorySubscription, ActivityFeed.
- **Dependencies:** identity/accounts via AccountReference (synchronous); organizations/organizations via OrganizationReference (synchronous)
- **Published events:** UserFollowed@1 (domain; contract pending), UserUnfollowed@1 (domain; contract pending), OrganizationFollowed@1 (domain; contract pending), OrganizationUnfollowed@1 (domain; contract pending)
- **Official sources:** identity-social-graph-source-01 ([following people, following organizations](https://docs.github.com/en/account-and-profile), unverified)

### enterprises/enterprises

- **Owns:** Enterprise, EnterpriseType, EnterpriseLifecycle, EnterpriseOrganizationLink.
- **Excludes:** EnterpriseMembership, EnterpriseRole, EnterprisePolicy.
- **Dependencies:** identity/accounts via ActorReference (synchronous)
- **Published events:** EnterpriseCreated@1 (domain; contract pending), EnterpriseProfileUpdated@1 (domain; contract pending), EnterpriseOrganizationLinked@1 (domain; contract pending), EnterpriseOrganizationUnlinked@1 (domain; contract pending), EnterpriseLifecycleChanged@1 (domain; contract pending)
- **Official sources:** enterprises-enterprises-source-01 ([enterprise accounts, enterprise organizations, enterprise repositories](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories), unverified)

### enterprises/enterprise-memberships

- **Owns:** EnterpriseMembership, EnterpriseInvitation, EnterpriseAffiliation, GuestCollaboratorStatus.
- **Excludes:** OrganizationMembership, RepositoryGrant, License.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via AccountReference (synchronous)
- **Published events:** EnterpriseInvitationCreated@1 (domain; contract pending), EnterpriseInvitationAccepted@1 (domain; contract pending), EnterpriseInvitationRevoked@1 (domain; contract pending), EnterpriseMemberAdded@1 (domain; contract pending), EnterpriseMemberRemoved@1 (domain; contract pending), EnterpriseAffiliationChanged@1 (domain; contract pending), GuestCollaboratorStatusChanged@1 (domain; contract pending)
- **Official sources:** enterprises-enterprise-memberships-source-01 ([enterprise members, unaffiliated users, guest collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise), unverified)

### enterprises/enterprise-teams

- **Owns:** EnterpriseTeam, EnterpriseTeamMembership, EnterpriseTeamOrganizationGrant.
- **Excludes:** OrganizationTeam, RepositoryGrant, CostCenter.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseMemberReference (synchronous)
- **Published events:** EnterpriseTeamCreated@1 (domain; contract pending), EnterpriseTeamUpdated@1 (domain; contract pending), EnterpriseTeamDeleted@1 (domain; contract pending), EnterpriseTeamMemberAdded@1 (domain; contract pending), EnterpriseTeamMemberRemoved@1 (domain; contract pending), EnterpriseTeamOrganizationGranted@1 (domain; contract pending), EnterpriseTeamOrganizationRevoked@1 (domain; contract pending)
- **Official sources:** enterprises-enterprise-teams-source-01 ([enterprise teams, enterprise team membership](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise), unverified)

### enterprises/enterprise-roles

- **Owns:** EnterpriseRoleDefinition, EnterpriseRoleAssignment, EnterprisePermission.
- **Excludes:** OrganizationRole, RepositoryRole, BillingAccount.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseMemberReference (synchronous); enterprises/enterprise-teams via EnterpriseTeamReference (synchronous)
- **Published events:** EnterpriseRoleDefined@1 (domain; contract pending), EnterpriseRoleUpdated@1 (domain; contract pending), EnterpriseRoleDeleted@1 (domain; contract pending), EnterpriseRoleAssigned@1 (domain; contract pending), EnterpriseRoleRevoked@1 (domain; contract pending)
- **Official sources:** enterprises-enterprise-roles-source-01 ([enterprise roles, custom enterprise roles, enterprise permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles), unverified)

### enterprises/enterprise-iam

- **Owns:** IdentityProviderConfiguration, ProvisionedIdentity, ExternalGroupBinding, SetupUserConfiguration.
- **Excludes:** InteractiveSession, AccountProfile, OrganizationRole.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via ManagedAccountProvisioning (synchronous); identity/authentication via ExternalAuthenticationBinding (synchronous); enterprises/enterprise-memberships via EnterpriseMembershipProvisioning (synchronous)
- **Published events:** IdentityProviderConfigured@1 (domain; contract pending), ProvisionedIdentityCreated@1 (domain; contract pending), ProvisionedIdentitySuspended@1 (domain; contract pending), ProvisionedIdentityReinstated@1 (domain; contract pending), ProvisionedIdentityDeprovisioned@1 (domain; contract pending), ExternalGroupLinked@1 (domain; contract pending), ExternalGroupUnlinked@1 (domain; contract pending)
- **Official sources:** enterprises-enterprise-iam-source-01 ([enterprise IAM, SAML, OIDC, SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam), unverified)

### enterprises/enterprise-policies

- **Owns:** EnterprisePolicy, EnterprisePolicyEnforcement, OrganizationPolicyOverrideState.
- **Excludes:** OrganizationPolicy, CodeRuleset, ActionsPolicy.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** EnterprisePolicyChanged@1 (domain; contract pending), EnterprisePolicyEnforcementChanged@1 (domain; contract pending), OrganizationPolicyOverrideChanged@1 (domain; contract pending)
- **Official sources:** enterprises-enterprise-policies-source-01 ([enterprise policies, organization constraints, repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies), unverified)

### enterprises/custom-properties

- **Owns:** EnterpriseRepositoryPropertyDefinition, EnterpriseOrganizationPropertyDefinition, EnterprisePropertyDefault, EnterprisePropertyEditPolicy, OrganizationPropertyValue, EnterpriseRepositoryPropertyPromotion.
- **Excludes:** OrganizationRepositoryPropertyDefinition, RepositoryPropertyValue, RepositoryTopic, IssueField.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); organizations/organizations via OrganizationReference (synchronous); organizations/custom-properties via OrganizationPropertyPromotionRequests (event) [OrganizationRepositoryPropertyPromotionRequested@1]
- **Published events:** EnterpriseRepositoryPropertyDefined@1 (domain; contract pending), EnterpriseRepositoryPropertyUpdated@1 (domain; contract pending), EnterpriseRepositoryPropertyDeleted@1 (domain; contract pending), EnterpriseRepositoryPropertyPromoted@1 (domain; contract pending), EnterpriseOrganizationPropertyDefined@1 (domain; contract pending), EnterpriseOrganizationPropertyUpdated@1 (domain; contract pending), EnterpriseOrganizationPropertyDeleted@1 (domain; contract pending), OrganizationPropertyValueSet@1 (domain; contract pending), OrganizationPropertyValueCleared@1 (domain; contract pending)
- **Official sources:** enterprises-custom-properties-source-01 ([enterprise-defined repository properties, enterprise defaults and edit policy, organization property promotion](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/managing-custom-properties-for-repositories-in-your-enterprise), checked 2026-07-22); enterprises-custom-properties-source-02 ([enterprise-defined organization properties, organization property values, organization property defaults](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-organizations-in-your-enterprise/managing-custom-properties-for-organizations), checked 2026-07-22)

### organizations/organizations

- **Owns:** Organization, OrganizationProfile, OrganizationLifecycle, VerifiedDomain.
- **Excludes:** OrganizationMembership, OrganizationTeam, Repository.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** OrganizationCreated@1 (domain; contract pending), OrganizationProfileUpdated@1 (domain; contract pending), OrganizationRenamed@1 (domain; contract pending), OrganizationLifecycleChanged@1 (domain; contract pending), VerifiedDomainAdded@1 (domain; contract pending), VerifiedDomainRemoved@1 (domain; contract pending), EnterpriseOwnershipChanged@1 (domain; contract pending)
- **Official sources:** organizations-organizations-source-01 ([organizations, organization ownership, organization profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations), unverified)

### organizations/organization-memberships

- **Owns:** OrganizationMembership, OrganizationInvitation, MembershipRole, MembershipState.
- **Excludes:** OutsideCollaborator, RepositoryInvitation, EnterpriseRole.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); identity/accounts via AccountReference (synchronous); enterprises/enterprise-memberships via EnterpriseAffiliation (synchronous)
- **Published events:** OrganizationInvitationCreated@1 (domain; contract pending), OrganizationInvitationAccepted@1 (domain; contract pending), OrganizationInvitationRevoked@1 (domain; contract pending), OrganizationMemberAdded@1 (domain; contract pending), OrganizationMemberRemoved@1 (domain; contract pending), OrganizationMemberRoleChanged@1 (domain; contract pending)
- **Official sources:** organizations-organization-memberships-source-01 ([organization membership, organization invitations, membership lifecycle](https://docs.github.com/en/organizations/managing-membership-in-your-organization), unverified)

### organizations/organization-teams

- **Owns:** OrganizationTeam, TeamMembership, TeamMaintainer, ParentTeamReference, TeamVisibility.
- **Excludes:** EnterpriseTeam, OutsideCollaborator, RepositoryRole.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMemberReference (synchronous)
- **Published events:** OrganizationTeamCreated@1 (domain; contract pending), OrganizationTeamUpdated@1 (domain; contract pending), OrganizationTeamDeleted@1 (domain; contract pending), TeamMemberAdded@1 (domain; contract pending), TeamMemberRemoved@1 (domain; contract pending), TeamMaintainerChanged@1 (domain; contract pending), ParentTeamChanged@1 (domain; contract pending), TeamVisibilityChanged@1 (domain; contract pending)
- **Official sources:** organizations-organization-teams-source-01 ([organization teams, nested teams, team visibility, team maintainers](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams), unverified)

### organizations/organization-roles

- **Owns:** OrganizationRoleDefinition, OrganizationRoleAssignment, OrganizationPermission, CustomRepositoryRoleDefinition.
- **Excludes:** EnterpriseRole, RepositoryRoleAssignment, TeamMaintainer.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMemberReference (synchronous); organizations/organization-teams via OrganizationTeamReference (synchronous)
- **Published events:** OrganizationRoleDefined@1 (domain; contract pending), OrganizationRoleUpdated@1 (domain; contract pending), OrganizationRoleDeleted@1 (domain; contract pending), OrganizationRoleAssigned@1 (domain; contract pending), OrganizationRoleRevoked@1 (domain; contract pending), CustomRepositoryRoleDefined@1 (domain; contract pending), CustomRepositoryRoleUpdated@1 (domain; contract pending), CustomRepositoryRoleDeleted@1 (domain; contract pending)
- **Official sources:** organizations-organization-roles-source-01 ([organization roles, custom organization roles, custom repository roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization), unverified)

### organizations/organization-policies

- **Owns:** RepositoryCreationPolicy, RepositoryVisibilityPolicy, OutsideCollaboratorPolicy, ProjectPolicy, DiscussionPolicy, BaseRepositoryPermission.
- **Excludes:** EnterprisePolicy, RepositoryGrant, CodeRuleset.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); enterprises/enterprise-policies via EnterprisePolicyConstraints (synchronous)
- **Published events:** OrganizationPolicyChanged@1 (domain; contract pending), BaseRepositoryPermissionChanged@1 (domain; contract pending)
- **Official sources:** organizations-organization-policies-source-01 ([organization settings, member privileges, repository policies](https://docs.github.com/en/organizations/managing-organization-settings), unverified)

### organizations/custom-properties

- **Owns:** OrganizationRepositoryPropertyDefinition, OrganizationRepositoryPropertyAllowedValue, RepositoryPropertyValue, RepositoryPropertyValueSource, RequiredRepositoryPropertyPolicy, ExplicitRepositoryPropertyRequirement, OrganizationRepositoryPropertyPromotionRequest.
- **Excludes:** EnterprisePropertyDefinition, OrganizationPropertyValue, RepositoryTopic, ProjectField, IssueField.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); enterprises/custom-properties via EnterpriseRepositoryPropertyDefinition (synchronous); repositories/repositories via RepositoryOperationalState (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]; enterprises/custom-properties via EnterprisePropertyPromotionEvents (event) [EnterpriseRepositoryPropertyPromoted@1]
- **Published events:** OrganizationRepositoryPropertyDefined@1 (domain; contract pending), OrganizationRepositoryPropertyUpdated@1 (domain; contract pending), OrganizationRepositoryPropertyDeleted@1 (domain; contract pending), OrganizationRepositoryPropertyPromotionRequested@1 (domain; contract pending), RepositoryPropertyValueSet@1 (domain; contract pending), RepositoryPropertyValueCleared@1 (domain; contract pending)
- **Official sources:** organizations-custom-properties-source-01 ([organization-defined repository property definitions, repository property values, required defaults and explicit values](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization), checked 2026-07-22)

### repositories/repositories

- **Owns:** Repository, RepositoryDescription, RepositoryHomepage, RepositoryRedirect, RepositoryTransfer, RepositoryOperationalState, RepositoryTombstone, RepositoryRestoreWindow.
- **Excludes:** GitObject, RepositoryGrant, Issue, Star, Subscription.
- **Dependencies:** identity/accounts via UserOwnerReference (synchronous); organizations/organizations via OrganizationOwnerReference (synchronous); organizations/organization-policies via RepositoryPolicyConstraints (synchronous); commerce/entitlements via RepositoryEntitlement (synchronous)
- **Published events:** RepositoryCreated@1 (domain; contract pending), RepositoryProfileUpdated@1 (domain; contract pending), RepositoryRenamed@1 (domain; contract pending), RepositoryVisibilityChanged@1 (domain; contract pending), RepositoryTransferRequested@1 (domain; contract pending), RepositoryTransferred@1 (domain; contract pending), RepositoryTransferRejected@1 (domain; contract pending), RepositoryTransferExpired@1 (domain; contract pending), RepositoryArchived@1 (domain; contract pending), RepositoryUnarchived@1 (domain; contract pending), RepositoryDeleted@1 (domain; contract pending), RepositoryRestored@1 (domain; contract pending)
- **Official sources:** repositories-repositories-source-01 ([repository identity, ownership](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories), checked 2026-07-22); repositories-repositories-source-02 ([repository creation, name, description, visibility](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository), checked 2026-07-22); repositories-repositories-source-03 ([repository transfer, transfer expiry, transfer effects](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-22); repositories-repositories-source-04 ([visibility changes, visibility-change effects](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22); repositories-repositories-source-05 ([archive, unarchive, archived repository read-only behavior, archived repository starring](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories), checked 2026-07-22); repositories-repositories-source-06 ([repository deletion, permanent team permission removal](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository), checked 2026-07-22); repositories-repositories-source-07 ([repository restoration, restore window, team permissions excluded from restoration](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository), checked 2026-07-22); repositories-repositories-source-08 ([repository rename, redirects](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository), checked 2026-07-22)

### repositories/repository-access

- **Owns:** RepositoryGrant, RepositoryInvitation, OutsideCollaboratorGrant, TeamRepositoryGrant, RepositoryRoleAssignment, EffectiveRepositoryPermissionDecision.
- **Excludes:** OrganizationMembership, OrganizationRoleDefinition, EffectivePermissionAsSourceOfTruth.
- **Dependencies:** repositories/repositories via RepositoryPermissionContextAndOperationalState (synchronous); identity/accounts via AccountReference (synchronous); organizations/organization-memberships via OrganizationMembershipPermissionContribution (synchronous); organizations/organization-teams via TeamRepositoryPermissionContribution (synchronous); organizations/organization-roles via OrganizationRepositoryRoleContribution (synchronous); organizations/organization-policies via OrganizationRepositoryPolicyContribution (synchronous); enterprises/enterprise-teams via EnterpriseTeamPermissionContribution (synchronous); enterprises/enterprise-roles via EnterpriseRepositoryPermissionContribution (synchronous); repositories/repositories via RepositoryLifecycleEvents (event) [RepositoryTransferred@1, RepositoryDeleted@1]
- **Published events:** RepositoryInvitationCreated@1 (domain; contract pending), RepositoryInvitationAccepted@1 (domain; contract pending), RepositoryInvitationRevoked@1 (domain; contract pending), RepositoryAccessGranted@1 (domain; contract pending), RepositoryAccessChanged@1 (domain; contract pending), RepositoryAccessRevoked@1 (domain; contract pending), TeamRepositoryAccessGranted@1 (domain; contract pending), TeamRepositoryAccessRevoked@1 (domain; contract pending), OutsideCollaboratorAccessGranted@1 (domain; contract pending), OutsideCollaboratorAccessRevoked@1 (domain; contract pending)
- **Official sources:** repositories-repository-access-source-01 ([organization repository roles, base permissions, organization owner privilege](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization), checked 2026-07-22); repositories-repository-access-source-02 ([personal repository owner, personal repository collaborators](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository), checked 2026-07-22); repositories-repository-access-source-03 ([direct team access, inherited team access](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/managing-team-access-to-an-organization-repository), checked 2026-07-22); repositories-repository-access-source-04 ([permanent team permission deletion](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository), checked 2026-07-22); repositories-repository-access-source-05 ([team permissions excluded from restoration](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository), checked 2026-07-22)

### repositories/repository-features

- **Owns:** IssuesFeatureConfiguration, IssueCreationPolicy, RepositoryDiscussionsFeatureState, ProjectsFeatureConfiguration.
- **Excludes:** Actions, Pages, Packages, SecurityScanning, WikiContent.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous); organizations/organization-policies via FeaturePolicyConstraints (synchronous); commerce/entitlements via FeatureEntitlement (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]
- **Published events:** RepositoryIssuesFeatureChanged@1 (domain; contract pending), RepositoryDiscussionsEnabled@1 (domain; contract pending), RepositoryDiscussionsDisabled@1 (domain; contract pending), RepositoryProjectsFeatureChanged@1 (domain; contract pending)
- **Official sources:** repositories-repository-features-source-01 ([issues enablement, collaborators-only issue creation, issue preservation while disabled](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-issues), checked 2026-07-22); repositories-repository-features-source-03 ([repository discussions enablement, repository admin enablement permission](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository), checked 2026-07-22); repositories-repository-features-source-04 ([repository Projects tab enablement, linked project preservation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-projects-in-a-repository), checked 2026-07-22); repositories-repository-features-source-02 ([feature loss after transfer, plan-dependent transfer effects](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-22)

### repositories/repository-metadata

- **Owns:** RepositoryTopicSet, RepositorySocialPreview.
- **Excludes:** RepositoryDescription, RepositoryHomepage, CustomPropertyDefinition, RepositoryPropertyValue, RepositoryContent.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous); platform/media-storage via MediaReference (synchronous)
- **Published events:** RepositoryTopicsChanged@1 (domain; contract pending), RepositorySocialPreviewChanged@1 (domain; contract pending), RepositorySocialPreviewRemoved@1 (domain; contract pending)
- **Official sources:** repositories-repository-metadata-source-01 ([topics, topic limits, public topic names](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics), checked 2026-07-22); repositories-repository-metadata-source-02 ([social-media preview, preview image restrictions](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview), checked 2026-07-22)

### collaboration/issues

- **Owns:** Issue, SubIssueRelation, IssueDependency, IssueTransfer, IssueTypeSelection, IssueFieldValueSet.
- **Excludes:** Comment, LabelDefinition, Project, PullRequest.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous); repositories/repository-access via RepositoryPermission (synchronous); repositories/repository-features via IssueFeatureState (synchronous); collaboration/issue-schema via IssueSchemaReference (synchronous); collaboration/labels-and-milestones via TaxonomyReference (synchronous); collaboration/conversations via IssueConversation (synchronous); repositories/repositories via RepositoryTransferEvents (event) [RepositoryTransferred@1]
- **Published events:** IssueCreated@1 (domain; contract pending), IssueUpdated@1 (domain; contract pending), IssueClosed@1 (domain; contract pending), IssueReopened@1 (domain; contract pending), IssueAssigned@1 (domain; contract pending), IssueUnassigned@1 (domain; contract pending), SubIssueAdded@1 (domain; contract pending), SubIssueRemoved@1 (domain; contract pending), IssueDependencyAdded@1 (domain; contract pending), IssueDependencyRemoved@1 (domain; contract pending), IssueTransferred@1 (domain; contract pending), IssueFieldValueSet@1 (domain; contract pending), IssueFieldValueCleared@1 (domain; contract pending)
- **Official sources:** collaboration-issues-source-01 ([issues, sub-issues, issue dependencies, issue metadata](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues), checked 2026-07-22); collaboration-issues-source-02 ([issue field values, issue field value permissions](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-and-managing-issue-fields), checked 2026-07-22); collaboration-issues-source-03 ([assignee reconciliation, issue type reconciliation](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository), checked 2026-07-22)

### collaboration/issue-schema

- **Owns:** IssueTypeDefinition, IssueFieldDefinition, IssueFieldVisibility, IssueFieldPinning, IssueTypeFieldAssociation.
- **Excludes:** ProjectField, CustomPropertyDefinition, Label, IssueFieldValue.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-policies via IssueSchemaPolicy (synchronous); commerce/entitlements via IssueSchemaEntitlement (synchronous)
- **Published events:** IssueTypeDefined@1 (domain; contract pending), IssueTypeUpdated@1 (domain; contract pending), IssueTypeRetired@1 (domain; contract pending), IssueFieldDefined@1 (domain; contract pending), IssueFieldUpdated@1 (domain; contract pending), IssueFieldRetired@1 (domain; contract pending)
- **Official sources:** collaboration-issue-schema-source-01 ([organization issue fields, field visibility, field pinning, type-field associations](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization), checked 2026-07-22); collaboration-issue-schema-source-02 ([organization issue types, issue type lifecycle](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-types-in-an-organization), checked 2026-07-22)

### collaboration/labels-and-milestones

- **Owns:** LabelCatalog, Label, Milestone.
- **Excludes:** Issue, Discussion, OrganizationDefaultLabelPolicy.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous)
- **Published events:** LabelCreated@1 (domain; contract pending), LabelUpdated@1 (domain; contract pending), LabelDeleted@1 (domain; contract pending), MilestoneCreated@1 (domain; contract pending), MilestoneUpdated@1 (domain; contract pending), MilestoneClosed@1 (domain; contract pending), MilestoneReopened@1 (domain; contract pending), MilestoneDeleted@1 (domain; contract pending)
- **Official sources:** collaboration-labels-and-milestones-source-01 ([labels, milestones, work classification](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work), unverified)

### collaboration/conversations

- **Owns:** Conversation, Comment, Reply, Reaction, Mention, CommentRevision, ConversationSubjectKind, ConversationCapabilities.
- **Excludes:** IssueState, DiscussionCategory, ModerationCase, ArbitrarySubjectType.
- **Dependencies:** identity/accounts via ActorReference (synchronous); repositories/repositories via RepositoryOperationalState (synchronous)
- **Published events:** ConversationCreated@1 (domain; contract pending), ConversationLocked@1 (domain; contract pending), ConversationUnlocked@1 (domain; contract pending), CommentAdded@1 (domain; contract pending), CommentEdited@1 (domain; contract pending), CommentDeleted@1 (domain; contract pending), ReplyAdded@1 (domain; contract pending), ReactionAdded@1 (domain; contract pending), ReactionRemoved@1 (domain; contract pending), MentionDetected@1 (domain; contract pending)
- **Official sources:** collaboration-conversations-source-01 ([comments, mentions, reactions](https://docs.github.com/en/get-started/using-github/communicating-on-github), checked 2026-07-22); collaboration-conversations-source-02 ([discussion comment threads, threaded replies](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion), checked 2026-07-22); collaboration-conversations-source-03 ([issue conversation locks, locked-conversation behavior](https://docs.github.com/en/communities/moderating-comments-and-conversations/locking-conversations), checked 2026-07-22)

### collaboration/discussions

- **Owns:** RepositoryDiscussionForum, OrganizationDiscussionSpace, Discussion, DiscussionCategory, DiscussionSection, DiscussionPoll, AcceptedAnswer, PinnedDiscussion.
- **Excludes:** Comment, LabelDefinition, Issue, TeamDiscussion.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous); organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via DiscussionPermission (synchronous); repositories/repository-features via RepositoryDiscussionFeatureState (synchronous); repositories/repository-features via RepositoryDiscussionFeatureEvents (event) [RepositoryDiscussionsEnabled@1, RepositoryDiscussionsDisabled@1]; collaboration/labels-and-milestones via LabelReference (synchronous); collaboration/conversations via DiscussionConversation (synchronous); organizations/organization-memberships via OrganizationDiscussionAdministration (synchronous); organizations/organization-policies via DiscussionCreationPolicy (synchronous)
- **Published events:** DiscussionCreated@1 (domain; contract pending), DiscussionUpdated@1 (domain; contract pending), DiscussionClosed@1 (domain; contract pending), DiscussionReopened@1 (domain; contract pending), DiscussionTransferred@1 (domain; contract pending), DiscussionCategoryCreated@1 (domain; contract pending), DiscussionCategoryUpdated@1 (domain; contract pending), DiscussionCategoryDeleted@1 (domain; contract pending), DiscussionAnswerMarked@1 (domain; contract pending), DiscussionAnswerUnmarked@1 (domain; contract pending), DiscussionPinned@1 (domain; contract pending), DiscussionUnpinned@1 (domain; contract pending), DiscussionPollClosed@1 (domain; contract pending), OrganizationDiscussionSpaceEnabled@1 (domain; contract pending), OrganizationDiscussionSpaceDisabled@1 (domain; contract pending), OrganizationDiscussionSourceChanged@1 (domain; contract pending)
- **Official sources:** collaboration-discussions-source-01 ([repository discussions, organization discussions, discussion categories](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions), checked 2026-07-22); collaboration-discussions-source-02 ([answers, pins, transfer, discussion lifecycle](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions), checked 2026-07-22); collaboration-discussions-source-03 ([repository discussion availability prerequisite](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository), checked 2026-07-22); collaboration-discussions-source-04 ([organization discussion enablement, source repository, source-repository permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/enabling-or-disabling-github-discussions-for-an-organization), checked 2026-07-22)

### collaboration/moderation

- **Owns:** ContentReport, ModerationCase, InteractionLimit, OrganizationBlock, ContentVisibilityDecision.
- **Excludes:** CommentBody, IssueState, DiscussionState.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via ModerationPermission (synchronous); collaboration/issues via IssueModerationTarget (synchronous); collaboration/conversations via ConversationModerationTarget (synchronous); collaboration/discussions via DiscussionModerationTarget (synchronous)
- **Published events:** ContentReported@1 (domain; contract pending), ContentReportResolved@1 (domain; contract pending), ContentReportReopened@1 (domain; contract pending), InteractionLimitSet@1 (domain; contract pending), InteractionLimitLifted@1 (domain; contract pending), OrganizationBlocked@1 (domain; contract pending), OrganizationUnblocked@1 (domain; contract pending), ContentHidden@1 (domain; contract pending), ContentUnhidden@1 (domain; contract pending)
- **Official sources:** collaboration-moderation-source-01 ([content moderation, interaction limits, blocking, conversation locking](https://docs.github.com/en/communities/moderating-comments-and-conversations), unverified)

### collaboration/projects

- **Owns:** Project, ProjectItem, DraftIssue, ProjectView, ProjectField, ProjectWorkflow, ProjectChart, ProjectTemplate, ProjectStatusUpdate.
- **Excludes:** RepositoryOwnership, Issue, IssueFieldDefinition.
- **Dependencies:** identity/accounts via UserProjectOwner (synchronous); organizations/organizations via OrganizationProjectOwner (synchronous); organizations/organization-policies via ProjectPolicy (synchronous); collaboration/issues via IssueProjectItem (synchronous); commerce/entitlements via ProjectEntitlement (synchronous)
- **Published events:** ProjectCreated@1 (domain; contract pending), ProjectUpdated@1 (domain; contract pending), ProjectClosed@1 (domain; contract pending), ProjectReopened@1 (domain; contract pending), ProjectDeleted@1 (domain; contract pending), ProjectItemAdded@1 (domain; contract pending), ProjectItemUpdated@1 (domain; contract pending), ProjectItemRemoved@1 (domain; contract pending), ProjectViewChanged@1 (domain; contract pending), ProjectFieldChanged@1 (domain; contract pending), ProjectWorkflowChanged@1 (domain; contract pending), ProjectStatusUpdated@1 (domain; contract pending)
- **Official sources:** collaboration-projects-source-01 ([projects, views, fields, workflows, charts, templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects), unverified)

### engagement/stars

- **Owns:** RepositoryStar, StarList, StarListEntry.
- **Excludes:** RepositorySubscription, Notification, UserFollow.
- **Dependencies:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryStarrableOperationalState (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous); repositories/repositories via RepositoryVisibilityEvents (event) [RepositoryVisibilityChanged@1]
- **Published events:** RepositoryStarred@1 (domain; contract pending), RepositoryUnstarred@1 (domain; contract pending), StarListCreated@1 (domain; contract pending), StarListUpdated@1 (domain; contract pending), StarListDeleted@1 (domain; contract pending), StarListEntryAdded@1 (domain; contract pending), StarListEntryRemoved@1 (domain; contract pending)
- **Official sources:** engagement-stars-source-01 ([repository stars, star lists, discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars), checked 2026-07-22); engagement-stars-source-02 ([stars removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22); engagement-stars-source-03 ([starring archived repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories), checked 2026-07-22)

### engagement/subscriptions

- **Owns:** RepositoryWatchPreference, RepositoryEventPreference, ConversationParticipation, ManualConversationSubscription, IgnorePreference.
- **Excludes:** Notification, NotificationReason, EmailDelivery, RepositoryStar.
- **Dependencies:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryReference (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous); collaboration/conversations via ConversationReference (synchronous); repositories/repositories via RepositoryVisibilityEvents (event) [RepositoryVisibilityChanged@1]
- **Published events:** RepositorySubscriptionChanged@1 (domain; contract pending), ConversationSubscriptionChanged@1 (domain; contract pending)
- **Official sources:** engagement-subscriptions-source-01 ([repository watches, conversation subscriptions, automatic participation](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), checked 2026-07-22); engagement-subscriptions-source-02 ([custom watch preferences, ignore preference](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications), checked 2026-07-22); engagement-subscriptions-source-03 ([watchers removed by visibility changes](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility), checked 2026-07-22)

### engagement/notifications

- **Owns:** Notification, NotificationInbox, NotificationReason, NotificationState, InboxFilter.
- **Excludes:** SubscriptionPreference, EmailDelivery, PushDelivery.
- **Dependencies:** identity/accounts via NotificationRecipient (synchronous); engagement/subscriptions via NotificationInterestDecision (synchronous); repositories/repository-access via EffectiveReadPermission (synchronous); collaboration/issues via IssueNotificationEvents (event) [IssueCreated@1, IssueUpdated@1, IssueAssigned@1, IssueUnassigned@1, IssueClosed@1, IssueReopened@1]; collaboration/conversations via ConversationNotificationEvents (event) [CommentAdded@1, ReplyAdded@1, MentionDetected@1]; collaboration/discussions via DiscussionNotificationEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionAnswerMarked@1]; repositories/repository-access via RepositoryInvitationEvents (event) [RepositoryInvitationCreated@1]
- **Published events:** NotificationCreated@1 (domain; contract pending), NotificationRead@1 (domain; contract pending), NotificationUnread@1 (domain; contract pending), NotificationSaved@1 (domain; contract pending), NotificationUnsaved@1 (domain; contract pending), NotificationDone@1 (domain; contract pending), NotificationReopened@1 (domain; contract pending), InboxFilterChanged@1 (domain; contract pending), NotificationDeliveryRequested@1 (integration; contract pending)
- **Official sources:** engagement-notifications-source-01 ([notifications, recipient interest, notification retention](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), checked 2026-07-22); engagement-notifications-source-02 ([notification reasons, inbox filters, notification state](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters), checked 2026-07-22)

### integrations/github-app-registrations

- **Owns:** GitHubAppRegistration, GitHubAppOwnerReference, GitHubAppPermissionRequest, GitHubAppWebhookPreference, RequestedWebhookEvents, WebhookActivationState.
- **Excludes:** AppInstallation, UserAuthorization, WebhookDelivery.
- **Dependencies:** identity/accounts via UserAppOwner (synchronous); organizations/organizations via OrganizationAppOwner (synchronous); enterprises/enterprises via EnterpriseAppOwner (synchronous); commerce/entitlements via AppEntitlement (synchronous)
- **Published events:** GitHubAppRegistered@1 (domain; contract pending), GitHubAppUpdated@1 (domain; contract pending), GitHubAppDeleted@1 (domain; contract pending), GitHubAppPermissionsChanged@1 (domain; contract pending), GitHubAppWebhookConfigurationChanged@1 (domain; contract pending), GitHubAppOwnershipTransferred@1 (domain; contract pending)
- **Official sources:** integrations-github-app-registrations-source-01 ([app registration, app ownership, app permissions, app visibility](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app), checked 2026-07-22); integrations-github-app-registrations-source-02 ([GitHub App registration ownership transfer, eligible destination account types, transfer effects](https://docs.github.com/en/apps/maintaining-github-apps/transferring-ownership-of-a-github-app), checked 2026-07-22); integrations-github-app-registrations-source-03 ([GitHub App registration updates, permission changes, webhook configuration changes](https://docs.github.com/en/apps/maintaining-github-apps/modifying-a-github-app-registration), checked 2026-07-22); integrations-github-app-registrations-source-04 ([GitHub App registration deletion, installation removal after registration deletion](https://docs.github.com/en/apps/maintaining-github-apps/deleting-a-github-app), checked 2026-07-22)

### integrations/github-app-installations

- **Owns:** AppInstallation, InstallationTargetReference, InstallationRepositorySelection, InstallationPermissionGrant.
- **Excludes:** AppRegistration, OAuthAuthorization, RepositoryGrant.
- **Dependencies:** integrations/github-app-registrations via GitHubAppRegistrationReference (synchronous); integrations/github-app-registrations via GitHubAppRegistrationLifecycleEvents (event) [GitHubAppDeleted@1]; identity/accounts via UserInstallationTarget (synchronous); organizations/organizations via OrganizationInstallationTarget (synchronous); repositories/repositories via InstallationRepositoryReference (synchronous); repositories/repository-access via InstallationPermission (synchronous)
- **Published events:** GitHubAppInstalled@1 (domain; contract pending), GitHubAppInstallationSuspended@1 (domain; contract pending), GitHubAppInstallationUnsuspended@1 (domain; contract pending), GitHubAppUninstalled@1 (domain; contract pending), GitHubAppInstallationRepositorySelectionChanged@1 (domain; contract pending), GitHubAppInstallationPermissionsChanged@1 (domain; contract pending)
- **Official sources:** integrations-github-app-installations-source-01 ([app installation, installation targets, repository selection, installation lifecycle](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app), checked 2026-07-22); integrations-github-app-installations-source-02 ([installation suspension, installation unsuspension, suspending actor authority](https://docs.github.com/en/apps/maintaining-github-apps/suspending-a-github-app-installation), checked 2026-07-22); integrations-github-app-installations-source-03 ([installation repository selection, installation suspension by target owner, installation uninstall](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps), checked 2026-07-22)

### integrations/oauth-app-registrations

- **Owns:** OAuthClient, OAuthAppOwnerReference, OAuthCallbackConfiguration.
- **Excludes:** OAuthAuthorization, GitHubAppRegistration, TokenStorageAdapter.
- **Dependencies:** identity/accounts via UserOAuthAppOwner (synchronous); organizations/organizations via OrganizationOAuthAppOwner (synchronous)
- **Published events:** OAuthClientRegistered@1 (domain; contract pending), OAuthClientUpdated@1 (domain; contract pending), OAuthClientDeleted@1 (domain; contract pending)
- **Official sources:** integrations-oauth-app-registrations-source-01 ([OAuth App registration, OAuth client ownership, callback configuration](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), checked 2026-07-22)

### integrations/oauth-authorizations

- **Owns:** OAuthAuthorization, AuthorizationScope, AuthorizationRevocation.
- **Excludes:** GitHubAppInstallation, InteractiveSession, TokenStorageAdapter.
- **Dependencies:** integrations/oauth-app-registrations via OAuthClientReference (synchronous); identity/accounts via AuthorizingUserReference (synchronous); organizations/organization-policies via OAuthPolicyConstraints (synchronous)
- **Published events:** OAuthAuthorizationGranted@1 (domain; contract pending), OAuthAuthorizationRevoked@1 (domain; contract pending), OAuthScopesChanged@1 (domain; contract pending)
- **Official sources:** integrations-oauth-authorizations-source-01 ([OAuth App user authorization, OAuth scopes, authorization revocation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps), checked 2026-07-22)

### integrations/repository-autolinks

- **Owns:** RepositoryAutolink, AutolinkPrefix, AutolinkIdentifierFormat, AutolinkTargetTemplate.
- **Excludes:** ExternalResource, RepositoryContent, ContentRendering.
- **Dependencies:** repositories/repositories via RepositoryOperationalState (synchronous); repositories/repository-access via RepositoryAdministrationPermission (synchronous); commerce/entitlements via RepositoryAutolinkEntitlement (synchronous)
- **Published events:** RepositoryAutolinkCreated@1 (domain; contract pending), RepositoryAutolinkUpdated@1 (domain; contract pending), RepositoryAutolinkDeleted@1 (domain; contract pending)
- **Official sources:** integrations-repository-autolinks-source-01 ([repository autolinks, non-overlapping prefixes, identifier formats, target template](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-autolinks-to-reference-external-resources), checked 2026-07-22)

### integrations/webhooks

- **Owns:** Webhook, WebhookEventSelection, WebhookSecretReference, GitHubAppWebhookEndpointProjection, WebhookDelivery, WebhookDeliveryAttempt.
- **Excludes:** DomainEvent, ArbitraryDatabasePolling, RawSecretStorage.
- **Dependencies:** integrations/github-app-registrations via GitHubAppWebhookConfigurationEvents (event) [GitHubAppWebhookConfigurationChanged@1]; integrations/github-app-installations via InstallationWebhookScope (synchronous); repositories/repositories via RepositoryWebhookTargetAndOperationalState (synchronous); organizations/organizations via OrganizationWebhookTarget (synchronous); enterprises/enterprises via EnterpriseWebhookTarget (synchronous); organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; repositories/repositories via PublishedEventContract (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1, RepositoryTransferred@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1]; collaboration/issues via PublishedEventContract (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via PublishedEventContract (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via PublishedEventContract (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1]; engagement/stars via PublishedEventContract (event) [RepositoryStarred@1, RepositoryUnstarred@1]; integrations/github-app-installations via PublishedEventContract (event) [GitHubAppInstalled@1, GitHubAppInstallationSuspended@1, GitHubAppInstallationUnsuspended@1, GitHubAppUninstalled@1]
- **Published events:** WebhookCreated@1 (domain; contract pending), WebhookUpdated@1 (domain; contract pending), WebhookDeleted@1 (domain; contract pending), WebhookDeliveryQueued@1 (domain; contract pending), WebhookDeliverySucceeded@1 (domain; contract pending), WebhookDeliveryFailed@1 (domain; contract pending), WebhookRedelivered@1 (domain; contract pending)
- **Official sources:** integrations-webhooks-source-01 ([webhook events, payloads, webhook types](https://docs.github.com/en/webhooks/webhook-events-and-payloads), checked 2026-07-22); integrations-webhooks-source-02 ([deliveries, attempts, redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries), checked 2026-07-22); integrations-webhooks-source-03 ([GitHub App webhook projection, GitHub App webhook delivery configuration](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/using-webhooks-with-github-apps), checked 2026-07-22)

### commerce/billing

- **Owns:** BillingAccount, PaymentProfile, UsageRecord, Budget, CostCenter, Invoice.
- **Excludes:** FeatureEntitlement, LicenseAssignment, PaymentProviderRecord.
- **Dependencies:** identity/accounts via PersonalBillingOwner (synchronous); organizations/organizations via OrganizationBillingOwner (synchronous); enterprises/enterprises via EnterpriseBillingOwner (synchronous)
- **Published events:** BillingAccountCreated@1 (domain; contract pending), BillingAccountUpdated@1 (domain; contract pending), PaymentProfileUpdated@1 (domain; contract pending), UsageRecorded@1 (domain; contract pending), BudgetCreated@1 (domain; contract pending), BudgetUpdated@1 (domain; contract pending), BudgetExceeded@1 (domain; contract pending), CostCenterCreated@1 (domain; contract pending), CostCenterUpdated@1 (domain; contract pending), CostCenterDeleted@1 (domain; contract pending), InvoiceIssued@1 (domain; contract pending), InvoicePaid@1 (domain; contract pending)
- **Official sources:** commerce-billing-source-01 ([billing accounts, usage, budgets, cost centers](https://docs.github.com/en/billing/get-started/introduction-to-billing), unverified)

### commerce/entitlements

- **Owns:** Plan, FeatureEntitlement, License, LicenseAssignment, UsageLimit.
- **Excludes:** Invoice, OrganizationMembership, EnterpriseRole.
- **Dependencies:** commerce/billing via BillingStanding (synchronous); identity/accounts via UserEntitlementOwner (synchronous); organizations/organizations via OrganizationEntitlementOwner (synchronous); enterprises/enterprises via EnterpriseEntitlementOwner (synchronous)
- **Published events:** PlanChanged@1 (domain; contract pending), EntitlementGranted@1 (domain; contract pending), EntitlementRevoked@1 (domain; contract pending), LicenseAssigned@1 (domain; contract pending), LicenseRevoked@1 (domain; contract pending), UsageLimitReached@1 (domain; contract pending)
- **Official sources:** commerce-entitlements-source-01 ([plans, licenses, license assignment, usage limits](https://docs.github.com/en/billing/how-tos/manage-plan-and-licenses), unverified)

### governance/audit-logs

- **Owns:** AuditEvent, AuditScope, AuditActor, AuditTarget, AuditExport, AuditRetentionPolicy.
- **Excludes:** ProductActivityFeed, StorageRecord, ArbitraryApplicationLog.
- **Dependencies:** organizations/organizations via OrganizationAuditScope (synchronous); enterprises/enterprises via EnterpriseAuditScope (synchronous); platform/audit-storage via AuditStoragePort (synchronous); identity/accounts via PublishedEventContract (event) [AccountSuspended@1, AccountReinstated@1, AccountDeleted@1]; enterprises/enterprise-memberships via PublishedEventContract (event) [EnterpriseMemberAdded@1, EnterpriseMemberRemoved@1, EnterpriseAffiliationChanged@1]; enterprises/enterprise-roles via PublishedEventContract (event) [EnterpriseRoleDefined@1, EnterpriseRoleUpdated@1, EnterpriseRoleDeleted@1, EnterpriseRoleAssigned@1, EnterpriseRoleRevoked@1]; enterprises/enterprise-iam via PublishedEventContract (event) [IdentityProviderConfigured@1, ProvisionedIdentityCreated@1, ProvisionedIdentitySuspended@1, ProvisionedIdentityReinstated@1, ProvisionedIdentityDeprovisioned@1]; enterprises/enterprise-policies via PublishedEventContract (event) [EnterprisePolicyChanged@1, EnterprisePolicyEnforcementChanged@1, OrganizationPolicyOverrideChanged@1]; organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; organizations/organization-teams via PublishedEventContract (event) [OrganizationTeamCreated@1, OrganizationTeamUpdated@1, OrganizationTeamDeleted@1, TeamMemberAdded@1, TeamMemberRemoved@1, TeamMaintainerChanged@1]; organizations/organization-roles via PublishedEventContract (event) [OrganizationRoleDefined@1, OrganizationRoleUpdated@1, OrganizationRoleDeleted@1, OrganizationRoleAssigned@1, OrganizationRoleRevoked@1, CustomRepositoryRoleDefined@1, CustomRepositoryRoleUpdated@1, CustomRepositoryRoleDeleted@1]; organizations/organization-policies via PublishedEventContract (event) [OrganizationPolicyChanged@1, BaseRepositoryPermissionChanged@1]; enterprises/custom-properties via PublishedEventContract (event) [EnterpriseRepositoryPropertyDefined@1, EnterpriseRepositoryPropertyUpdated@1, EnterpriseRepositoryPropertyDeleted@1, EnterpriseRepositoryPropertyPromoted@1, EnterpriseOrganizationPropertyDefined@1, EnterpriseOrganizationPropertyUpdated@1, EnterpriseOrganizationPropertyDeleted@1, OrganizationPropertyValueSet@1, OrganizationPropertyValueCleared@1]; organizations/custom-properties via PublishedEventContract (event) [OrganizationRepositoryPropertyDefined@1, OrganizationRepositoryPropertyUpdated@1, OrganizationRepositoryPropertyDeleted@1, OrganizationRepositoryPropertyPromotionRequested@1, RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1]; repositories/repositories via PublishedEventContract (event) [RepositoryVisibilityChanged@1, RepositoryTransferred@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1, OutsideCollaboratorAccessGranted@1, OutsideCollaboratorAccessRevoked@1]; integrations/github-app-registrations via PublishedEventContract (event) [GitHubAppRegistered@1, GitHubAppUpdated@1, GitHubAppDeleted@1, GitHubAppPermissionsChanged@1, GitHubAppOwnershipTransferred@1]; integrations/github-app-installations via PublishedEventContract (event) [GitHubAppInstalled@1, GitHubAppInstallationSuspended@1, GitHubAppInstallationUnsuspended@1, GitHubAppUninstalled@1, GitHubAppInstallationPermissionsChanged@1]; integrations/oauth-app-registrations via OAuthClientAuditEvents (event) [OAuthClientRegistered@1, OAuthClientUpdated@1, OAuthClientDeleted@1]; integrations/oauth-authorizations via PublishedEventContract (event) [OAuthAuthorizationGranted@1, OAuthAuthorizationRevoked@1, OAuthScopesChanged@1]; integrations/webhooks via PublishedEventContract (event) [WebhookCreated@1, WebhookUpdated@1, WebhookDeleted@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; commerce/billing via PublishedEventContract (event) [BillingAccountUpdated@1, PaymentProfileUpdated@1, BudgetCreated@1, BudgetUpdated@1, BudgetExceeded@1, CostCenterCreated@1, CostCenterUpdated@1, CostCenterDeleted@1]; commerce/entitlements via PublishedEventContract (event) [PlanChanged@1, EntitlementGranted@1, EntitlementRevoked@1, LicenseAssigned@1, LicenseRevoked@1, UsageLimitReached@1]
- **Published events:** AuditEventRecorded@1 (domain; contract pending), AuditExportRequested@1 (domain; contract pending), AuditExportCompleted@1 (domain; contract pending), AuditExportFailed@1 (domain; contract pending), AuditRetentionPolicyChanged@1 (domain; contract pending)
- **Official sources:** governance-audit-logs-source-01 ([enterprise audit log, audit search, audit export, audit streaming](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise), unverified)

### projections/search

- **Owns:** SearchDocument, SearchResultProjection.
- **Excludes:** SourceAggregate, AuthorizationSourceOfTruth, CodeSearch.
- **Dependencies:** identity/accounts via AccountSearchEvents (event) [AccountCreated@1, UsernameChanged@1, AccountDeleted@1]; organizations/organizations via OrganizationSearchEvents (event) [OrganizationCreated@1, OrganizationRenamed@1, OrganizationLifecycleChanged@1]; enterprises/custom-properties via EnterpriseCustomPropertySearchEvents (event) [EnterpriseRepositoryPropertyDefined@1, EnterpriseRepositoryPropertyUpdated@1, EnterpriseRepositoryPropertyDeleted@1, EnterpriseRepositoryPropertyPromoted@1, EnterpriseOrganizationPropertyDefined@1, EnterpriseOrganizationPropertyUpdated@1, EnterpriseOrganizationPropertyDeleted@1, OrganizationPropertyValueSet@1, OrganizationPropertyValueCleared@1]; organizations/custom-properties via RepositoryCustomPropertySearchEvents (event) [OrganizationRepositoryPropertyDefined@1, OrganizationRepositoryPropertyUpdated@1, OrganizationRepositoryPropertyDeleted@1, RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1]; repositories/repositories via RepositorySearchEvents (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via EffectiveReadPermission (synchronous); collaboration/issues via IssueSearchEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1, IssueTransferred@1]; collaboration/discussions via DiscussionSearchEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1, DiscussionTransferred@1]; collaboration/projects via ProjectSearchEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectDeleted@1]; platform/search-index via SearchIndexPort (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-search-source-01 ([global search, repository search, issue search, permission-filtered results](https://docs.github.com/en/search-github), unverified)

### projections/activity-feed

- **Owns:** ActivityItem, PersonalActivityFeed, RepositoryActivityFeed, OrganizationActivityFeed.
- **Excludes:** AuditEvent, DomainEventSource, CodeActivity.
- **Dependencies:** identity/social-graph via FollowEvents (event) [UserFollowed@1, UserUnfollowed@1, OrganizationFollowed@1, OrganizationUnfollowed@1]; repositories/repositories via RepositoryActivityEvents (event) [RepositoryCreated@1, RepositoryProfileUpdated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1]; collaboration/issues via IssueActivityEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionActivityEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via ProjectActivityEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectStatusUpdated@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-activity-feed-source-01 ([personal dashboard, activity feed, followed activity](https://docs.github.com/en/account-and-profile/concepts/personal-dashboard), unverified)

### projections/repository-insights

- **Owns:** RepositoryInsight, EngagementMetric, IntegrationHealthMetric.
- **Excludes:** GitActivityMetric, ContributorCodeMetric, SourceAggregate, RepositoryTrafficMetric.
- **Dependencies:** repositories/repositories via RepositoryInsightEvents (event) [RepositoryCreated@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1]; collaboration/issues via IssueMetricEvents (event) [IssueCreated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionMetricEvents (event) [DiscussionCreated@1, DiscussionClosed@1, DiscussionReopened@1]; engagement/stars via StarMetricEvents (event) [RepositoryStarred@1, RepositoryUnstarred@1]; engagement/subscriptions via SubscriptionMetricEvents (event) [RepositorySubscriptionChanged@1, ConversationSubscriptionChanged@1]; integrations/webhooks via WebhookHealthEvents (event) [WebhookDeliverySucceeded@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-repository-insights-source-01 ([repository engagement insights, repository graph availability](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/about-repository-graphs), checked 2026-07-22)

### platform/event-publication

- **Owns:** PublicationLease, PublicationCursor, PublicationAttempt, DeadLetterRecord, RedeliveryRequest.
- **Excludes:** ProductEventMeaning, ContextOutboxRecord, SourceContextTransaction, WebhookSubscription, NotificationInterest.
- **Dependencies:** None.
- **Published events:** IntegrationEventPublished@1 (technical; contract pending), EventPublicationFailed@1 (technical; contract pending), EventDeadLettered@1 (technical; contract pending), EventRedelivered@1 (technical; contract pending)
- **Official sources:** Not applicable; technical capability.

### platform/search-index

- **Owns:** IndexDocument, IndexCursor, IndexOperation.
- **Excludes:** SearchSemantics, AuthorizationDecision, SourceAggregate.
- **Dependencies:** None.
- **Published events:** SearchDocumentUpserted@1 (technical; contract pending), SearchDocumentRemoved@1 (technical; contract pending), SearchIndexRebuilt@1 (technical; contract pending)
- **Official sources:** Not applicable; technical capability.

### platform/media-storage

- **Owns:** MediaReference, MediaObject, MediaStoragePolicy.
- **Excludes:** RepositoryContent, ReleaseAsset, ProductVisibilityRule.
- **Dependencies:** None.
- **Published events:** MediaStored@1 (technical; contract pending), MediaDeleted@1 (technical; contract pending), MediaQuarantined@1 (technical; contract pending)
- **Official sources:** Not applicable; technical capability.

### platform/notification-channels

- **Owns:** ChannelDelivery, DeliveryAttempt, DeliveryProviderReference.
- **Excludes:** Notification, SubscriptionPreference, RecipientSelection.
- **Dependencies:** engagement/notifications via NotificationDeliveryRequests (event) [NotificationDeliveryRequested@1]
- **Published events:** ChannelDeliverySucceeded@1 (technical; contract pending), ChannelDeliveryFailed@1 (technical; contract pending)
- **Official sources:** Not applicable; technical capability.

### platform/audit-storage

- **Owns:** AuditStorageRecord, AuditExportJob, RetentionExecution.
- **Excludes:** AuditEventMeaning, AuditAuthorization, ProductActivityFeed.
- **Dependencies:** None.
- **Published events:** AuditRecordStored@1 (technical; contract pending), AuditStorageExportCompleted@1 (technical; contract pending), AuditRetentionApplied@1 (technical; contract pending)
- **Official sources:** Not applicable; technical capability.

All product semantics are justified by HTTPS sources under docs.github.com/en/.
Planned contexts do not receive source directories until implementation begins.
