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

## Bounded contexts

| Subdomain | Bounded context | Kind | Classification | Maturity | Status | Responsibility |
| --- | --- | --- | --- | --- | --- | --- |
| identity | accounts | domain | core | stable | planned | Personal, managed, setup, and bot account identity and lifecycle. |
| identity | authentication | domain | core | stable | planned | Credentials, sessions, two-factor authentication, recovery, and external login binding. |
| identity | profiles | domain | supporting | stable | planned | Public and private personal profiles, profile status, and pinned-item presentation. |
| identity | social-graph | domain | supporting | stable | planned | Following relationships between users and organizations. |
| enterprises | enterprises | domain | core | stable | planned | Enterprise identity, profile, account mode, lifecycle, and organization ownership. |
| enterprises | enterprise-memberships | domain | core | stable | planned | Enterprise membership, invitations, affiliation, guest collaborators, and unaffiliated users. |
| enterprises | enterprise-teams | domain | supporting | preview | planned | Enterprise-wide teams used for centralized role, organization, and license assignment. |
| enterprises | enterprise-roles | domain | core | stable | planned | Predefined and custom enterprise roles, permissions, and assignments. |
| enterprises | enterprise-iam | domain | core | stable | planned | Enterprise identity-provider configuration, SAML or OIDC authentication, SCIM provisioning, and group synchronization. |
| enterprises | enterprise-policies | domain | core | stable | planned | Enterprise policy constraints applied across owned organizations and repositories. |
| organizations | organizations | domain | core | stable | planned | Organization identity, profile, lifecycle, verified domains, and enterprise ownership. |
| organizations | organization-memberships | domain | core | stable | planned | Organization membership, invitations, member roles, and membership lifecycle. |
| organizations | organization-teams | domain | core | stable | planned | Organization teams, nested hierarchy, visibility, membership, maintainers, and mentions. |
| organizations | organization-roles | domain | supporting | stable | planned | Predefined and custom organization roles and custom repository-role definitions. |
| organizations | organization-policies | domain | core | stable | planned | Organization policies for repositories, collaborators, projects, discussions, and member privileges. |
| organizations | custom-properties | domain | supporting | stable | planned | Organization-defined custom-property schemas and organization or repository property values. |
| repositories | repositories | domain | core | stable | planned | Repository identity, personal or organization ownership, profile, visibility, lifecycle, redirects, and transfer. |
| repositories | repository-access | domain | core | stable | planned | Repository invitations, direct and team grants, outside collaborators, repository roles, and effective permission resolution. |
| repositories | repository-features | domain | supporting | stable | planned | Enablement and configuration of non-code repository product features. |
| repositories | repository-metadata | domain | supporting | stable | planned | Repository topics, social preview, and display metadata. |
| collaboration | issues | domain | core | stable | planned | Issue lifecycle, assignment, hierarchy, dependency, transfer, and work tracking. |
| collaboration | issue-schema | domain | supporting | stable | planned | Organization-level issue types, fields, visibility, and values shared across repositories and projects. |
| collaboration | labels-and-milestones | domain | supporting | stable | planned | Repository-scoped labels, milestones, and work classification. |
| collaboration | conversations | domain | supporting | stable | planned | Comments, replies, reactions, mentions, revisions, and conversation locks for a closed set of subjects. |
| collaboration | discussions | domain | core | stable | planned | Repository and organization discussion spaces, categories, sections, polls, answers, pins, and lifecycle. |
| collaboration | moderation | domain | supporting | stable | planned | Content reports, moderation cases, blocks, interaction limits, and visibility decisions. |
| collaboration | projects | domain | core | stable | planned | User- or organization-owned projects, items, draft issues, views, fields, workflows, charts, templates, and status updates. |
| engagement | stars | domain | supporting | stable | planned | Repository starring and user-defined star lists for discovery and collection. |
| engagement | subscriptions | domain | supporting | stable | planned | Repository and conversation subscription preferences and notification-interest decisions. |
| engagement | notifications | domain | supporting | stable | planned | User notification records, inboxes, reasons, filters, and read, saved, or done state. |
| integrations | app-registrations | domain | supporting | stable | planned | GitHub App registration, ownership, requested permissions, webhook configuration, and public or private availability. |
| integrations | app-installations | domain | supporting | stable | planned | GitHub App installation targets, selected repositories, granted permissions, suspension, and uninstall lifecycle. |
| integrations | oauth-authorizations | domain | supporting | stable | planned | OAuth client registration, user authorization, scopes, approval, and revocation. |
| integrations | webhooks | domain | supporting | stable | planned | Repository, organization, enterprise, and app webhook configuration, deliveries, attempts, and redelivery. |
| commerce | billing | domain | supporting | stable | planned | Billing accounts, payment profiles, usage, budgets, cost centers, invoices, and spending allocation. |
| commerce | entitlements | domain | supporting | stable | planned | Plans, feature entitlements, licenses, assignments, and usage limits. |
| governance | audit-logs | domain | supporting | stable | planned | Organization and enterprise audit events, scopes, actors, targets, search, export, streaming, and retention policy. |
| projections | search | projection | — | stable | planned | Permission-filtered search projections across users, organizations, repositories, issues, discussions, and projects. |
| projections | activity-feed | projection | — | stable | planned | User-visible dashboard and resource activity projections. |
| projections | repository-insights | projection | — | stable | planned | Non-code repository statistics, traffic, engagement trends, and integration health projections. |
| platform | event-publication | technical | — | stable | planned | Reliable domain and integration event publication, idempotency, retry, ordering, and dead-letter handling. |
| platform | search-index | technical | — | stable | planned | Search document indexing, querying, and index lifecycle adapters. |
| platform | media-storage | technical | — | stable | planned | Storage and retrieval of media referenced by product domains. |
| platform | notification-channels | technical | — | stable | planned | Inbox channel dispatch and external email or push delivery adapters. |
| platform | audit-storage | technical | — | stable | planned | Durable storage, export, and retention enforcement for audit records. |

## Ownership and relationships

### identity/accounts

- **Owns:** Account, Username, AccountLifecycle, GhostAttribution.
- **Excludes:** Credential, Session, Profile, EnterpriseMembership.
- **Dependencies:** None.
- **Published events:** AccountCreated@1 (domain), UsernameChanged@1 (domain), AccountSuspended@1 (domain), AccountReinstated@1 (domain), AccountDeleted@1 (domain)
- **Official sources:** identity-accounts-source-01 ([personal accounts, managed accounts, account lifecycle](https://docs.github.com/en/account-and-profile/concepts/account-management), verified unverified)

### identity/authentication

- **Owns:** Credential, Session, TwoFactorConfiguration, ExternalLoginBinding.
- **Excludes:** AccountLifecycle, ScimProvisioning, OAuthAppAuthorization.
- **Dependencies:** identity/accounts via AccountReference (synchronous)
- **Published events:** SessionCreated@1 (domain), SessionRevoked@1 (domain), TwoFactorEnabled@1 (domain), TwoFactorDisabled@1 (domain), ExternalLoginLinked@1 (domain), ExternalLoginUnlinked@1 (domain)
- **Official sources:** identity-authentication-source-01 ([authentication, sessions, two-factor authentication](https://docs.github.com/en/authentication), verified unverified)

### identity/profiles

- **Owns:** UserProfile, ProfileVisibility, ProfileStatus, PinnedItemSet.
- **Excludes:** AccountLifecycle, RepositoryStar, Project.
- **Dependencies:** identity/accounts via AccountReference (synchronous)
- **Published events:** ProfileUpdated@1 (domain), ProfileVisibilityChanged@1 (domain), ProfileStatusChanged@1 (domain), PinnedItemsChanged@1 (domain)
- **Official sources:** identity-profiles-source-01 ([profile, profile visibility, pinned items](https://docs.github.com/en/account-and-profile/concepts/personal-profile), verified unverified)

### identity/social-graph

- **Owns:** UserFollow, OrganizationFollow.
- **Excludes:** RepositoryStar, RepositorySubscription, ActivityFeed.
- **Dependencies:** identity/accounts via AccountReference (synchronous); organizations/organizations via OrganizationReference (synchronous)
- **Published events:** UserFollowed@1 (domain), UserUnfollowed@1 (domain), OrganizationFollowed@1 (domain), OrganizationUnfollowed@1 (domain)
- **Official sources:** identity-social-graph-source-01 ([following people, following organizations](https://docs.github.com/en/account-and-profile), verified unverified)

### enterprises/enterprises

- **Owns:** Enterprise, EnterpriseType, EnterpriseLifecycle, EnterpriseOrganizationLink.
- **Excludes:** EnterpriseMembership, EnterpriseRole, EnterprisePolicy.
- **Dependencies:** identity/accounts via ActorReference (synchronous)
- **Published events:** EnterpriseCreated@1 (domain), EnterpriseProfileUpdated@1 (domain), EnterpriseOrganizationLinked@1 (domain), EnterpriseOrganizationUnlinked@1 (domain), EnterpriseLifecycleChanged@1 (domain)
- **Official sources:** enterprises-enterprises-source-01 ([enterprise accounts, enterprise organizations, enterprise repositories](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories), verified unverified)

### enterprises/enterprise-memberships

- **Owns:** EnterpriseMembership, EnterpriseInvitation, EnterpriseAffiliation, GuestCollaboratorStatus.
- **Excludes:** OrganizationMembership, RepositoryGrant, License.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via AccountReference (synchronous)
- **Published events:** EnterpriseInvitationCreated@1 (domain), EnterpriseInvitationAccepted@1 (domain), EnterpriseInvitationRevoked@1 (domain), EnterpriseMemberAdded@1 (domain), EnterpriseMemberRemoved@1 (domain), EnterpriseAffiliationChanged@1 (domain), GuestCollaboratorStatusChanged@1 (domain)
- **Official sources:** enterprises-enterprise-memberships-source-01 ([enterprise members, unaffiliated users, guest collaborators](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/viewing-people-in-your-enterprise), verified unverified)

### enterprises/enterprise-teams

- **Owns:** EnterpriseTeam, EnterpriseTeamMembership, EnterpriseTeamOrganizationGrant.
- **Excludes:** OrganizationTeam, RepositoryGrant, CostCenter.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseMemberReference (synchronous)
- **Published events:** EnterpriseTeamCreated@1 (domain), EnterpriseTeamUpdated@1 (domain), EnterpriseTeamDeleted@1 (domain), EnterpriseTeamMemberAdded@1 (domain), EnterpriseTeamMemberRemoved@1 (domain), EnterpriseTeamOrganizationGranted@1 (domain), EnterpriseTeamOrganizationRevoked@1 (domain)
- **Official sources:** enterprises-enterprise-teams-source-01 ([enterprise teams, enterprise team membership](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise), verified unverified)

### enterprises/enterprise-roles

- **Owns:** EnterpriseRoleDefinition, EnterpriseRoleAssignment, EnterprisePermission.
- **Excludes:** OrganizationRole, RepositoryRole, BillingAccount.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); enterprises/enterprise-memberships via EnterpriseMemberReference (synchronous); enterprises/enterprise-teams via EnterpriseTeamReference (synchronous)
- **Published events:** EnterpriseRoleDefined@1 (domain), EnterpriseRoleUpdated@1 (domain), EnterpriseRoleDeleted@1 (domain), EnterpriseRoleAssigned@1 (domain), EnterpriseRoleRevoked@1 (domain)
- **Official sources:** enterprises-enterprise-roles-source-01 ([enterprise roles, custom enterprise roles, enterprise permissions](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles), verified unverified)

### enterprises/enterprise-iam

- **Owns:** IdentityProviderConfiguration, ProvisionedIdentity, ExternalGroupBinding, SetupUserConfiguration.
- **Excludes:** InteractiveSession, AccountProfile, OrganizationRole.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous); identity/accounts via ManagedAccountProvisioning (synchronous); identity/authentication via ExternalAuthenticationBinding (synchronous); enterprises/enterprise-memberships via EnterpriseMembershipProvisioning (synchronous)
- **Published events:** IdentityProviderConfigured@1 (domain), ProvisionedIdentityCreated@1 (domain), ProvisionedIdentitySuspended@1 (domain), ProvisionedIdentityReinstated@1 (domain), ProvisionedIdentityDeprovisioned@1 (domain), ExternalGroupLinked@1 (domain), ExternalGroupUnlinked@1 (domain)
- **Official sources:** enterprises-enterprise-iam-source-01 ([enterprise IAM, SAML, OIDC, SCIM](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam), verified unverified)

### enterprises/enterprise-policies

- **Owns:** EnterprisePolicy, EnterprisePolicyEnforcement, OrganizationPolicyOverrideState.
- **Excludes:** OrganizationPolicy, CodeRuleset, ActionsPolicy.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** EnterprisePolicyChanged@1 (domain), EnterprisePolicyEnforcementChanged@1 (domain), OrganizationPolicyOverrideChanged@1 (domain)
- **Official sources:** enterprises-enterprise-policies-source-01 ([enterprise policies, organization constraints, repository management policies](https://docs.github.com/en/enterprise-cloud@latest/admin/enforcing-policies), verified unverified)

### organizations/organizations

- **Owns:** Organization, OrganizationProfile, OrganizationLifecycle, VerifiedDomain.
- **Excludes:** OrganizationMembership, OrganizationTeam, Repository.
- **Dependencies:** enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** OrganizationCreated@1 (domain), OrganizationProfileUpdated@1 (domain), OrganizationRenamed@1 (domain), OrganizationLifecycleChanged@1 (domain), VerifiedDomainAdded@1 (domain), VerifiedDomainRemoved@1 (domain), EnterpriseOwnershipChanged@1 (domain)
- **Official sources:** organizations-organizations-source-01 ([organizations, organization ownership, organization profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/about-organizations), verified unverified)

### organizations/organization-memberships

- **Owns:** OrganizationMembership, OrganizationInvitation, MembershipRole, MembershipState.
- **Excludes:** OutsideCollaborator, RepositoryInvitation, EnterpriseRole.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); identity/accounts via AccountReference (synchronous); enterprises/enterprise-memberships via EnterpriseAffiliation (synchronous)
- **Published events:** OrganizationInvitationCreated@1 (domain), OrganizationInvitationAccepted@1 (domain), OrganizationInvitationRevoked@1 (domain), OrganizationMemberAdded@1 (domain), OrganizationMemberRemoved@1 (domain), OrganizationMemberRoleChanged@1 (domain)
- **Official sources:** organizations-organization-memberships-source-01 ([organization membership, organization invitations, membership lifecycle](https://docs.github.com/en/organizations/managing-membership-in-your-organization), verified unverified)

### organizations/organization-teams

- **Owns:** OrganizationTeam, TeamMembership, TeamMaintainer, ParentTeamReference, TeamVisibility.
- **Excludes:** EnterpriseTeam, OutsideCollaborator, RepositoryRole.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMemberReference (synchronous)
- **Published events:** OrganizationTeamCreated@1 (domain), OrganizationTeamUpdated@1 (domain), OrganizationTeamDeleted@1 (domain), TeamMemberAdded@1 (domain), TeamMemberRemoved@1 (domain), TeamMaintainerChanged@1 (domain), ParentTeamChanged@1 (domain), TeamVisibilityChanged@1 (domain)
- **Official sources:** organizations-organization-teams-source-01 ([organization teams, nested teams, team visibility, team maintainers](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams), verified unverified)

### organizations/organization-roles

- **Owns:** OrganizationRoleDefinition, OrganizationRoleAssignment, OrganizationPermission, CustomRepositoryRoleDefinition.
- **Excludes:** EnterpriseRole, RepositoryRoleAssignment, TeamMaintainer.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-memberships via OrganizationMemberReference (synchronous); organizations/organization-teams via OrganizationTeamReference (synchronous)
- **Published events:** OrganizationRoleDefined@1 (domain), OrganizationRoleUpdated@1 (domain), OrganizationRoleDeleted@1 (domain), OrganizationRoleAssigned@1 (domain), OrganizationRoleRevoked@1 (domain), CustomRepositoryRoleDefined@1 (domain), CustomRepositoryRoleUpdated@1 (domain), CustomRepositoryRoleDeleted@1 (domain)
- **Official sources:** organizations-organization-roles-source-01 ([organization roles, custom organization roles, custom repository roles](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization), verified unverified)

### organizations/organization-policies

- **Owns:** RepositoryCreationPolicy, RepositoryVisibilityPolicy, OutsideCollaboratorPolicy, ProjectPolicy, DiscussionPolicy, BaseRepositoryPermission.
- **Excludes:** EnterprisePolicy, RepositoryGrant, CodeRuleset.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); enterprises/enterprise-policies via EnterprisePolicyConstraints (synchronous)
- **Published events:** OrganizationPolicyChanged@1 (domain), BaseRepositoryPermissionChanged@1 (domain)
- **Official sources:** organizations-organization-policies-source-01 ([organization settings, member privileges, repository policies](https://docs.github.com/en/organizations/managing-organization-settings), verified unverified)

### organizations/custom-properties

- **Owns:** CustomPropertyDefinition, CustomPropertyAllowedValue, OrganizationPropertyValue, RepositoryPropertyValue.
- **Excludes:** RepositoryTopic, ProjectField, IssueField.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); enterprises/enterprises via EnterpriseReference (synchronous)
- **Published events:** CustomPropertyDefined@1 (domain), CustomPropertyUpdated@1 (domain), CustomPropertyDeleted@1 (domain), OrganizationPropertyValueSet@1 (domain), OrganizationPropertyValueCleared@1 (domain), RepositoryPropertyValueSet@1 (domain), RepositoryPropertyValueCleared@1 (domain)
- **Official sources:** organizations-custom-properties-source-01 ([custom property definitions, repository property values, organization property values](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization), verified unverified)

### repositories/repositories

- **Owns:** Repository, RepositoryRedirect, RepositoryTransfer.
- **Excludes:** GitObject, RepositoryGrant, Issue, Star, Subscription.
- **Dependencies:** identity/accounts via UserOwnerReference (synchronous); organizations/organizations via OrganizationOwnerReference (synchronous); organizations/organization-policies via RepositoryPolicyConstraints (synchronous); commerce/entitlements via RepositoryEntitlement (synchronous)
- **Published events:** RepositoryCreated@1 (domain), RepositoryProfileUpdated@1 (domain), RepositoryRenamed@1 (domain), RepositoryVisibilityChanged@1 (domain), RepositoryTransferRequested@1 (domain), RepositoryTransferred@1 (domain), RepositoryTransferRejected@1 (domain), RepositoryTransferExpired@1 (domain), RepositoryArchived@1 (domain), RepositoryUnarchived@1 (domain), RepositoryDeleted@1 (domain), RepositoryRestored@1 (domain)
- **Official sources:** repositories-repositories-source-01 ([repository identity, ownership, visibility, lifecycle](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories), verified unverified)

### repositories/repository-access

- **Owns:** RepositoryGrant, RepositoryInvitation, OutsideCollaboratorGrant, TeamRepositoryGrant, RepositoryRoleAssignment.
- **Excludes:** OrganizationMembership, OrganizationRoleDefinition, EffectivePermissionAsSourceOfTruth.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous); identity/accounts via AccountReference (synchronous); organizations/organization-memberships via OrganizationMembershipStatus (synchronous); organizations/organization-teams via OrganizationTeamMembership (synchronous); organizations/organization-roles via RepositoryRoleDefinition (synchronous); organizations/organization-policies via AccessPolicyConstraints (synchronous); enterprises/enterprise-teams via EnterpriseTeamGrant (synchronous); enterprises/enterprise-roles via EnterpriseRoleConstraints (synchronous)
- **Published events:** RepositoryInvitationCreated@1 (domain), RepositoryInvitationAccepted@1 (domain), RepositoryInvitationRevoked@1 (domain), RepositoryAccessGranted@1 (domain), RepositoryAccessChanged@1 (domain), RepositoryAccessRevoked@1 (domain), TeamRepositoryAccessGranted@1 (domain), TeamRepositoryAccessRevoked@1 (domain), OutsideCollaboratorAccessGranted@1 (domain), OutsideCollaboratorAccessRevoked@1 (domain)
- **Official sources:** repositories-repository-access-source-01 ([repository roles, team access, outside collaborators, effective access](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization), verified unverified)

### repositories/repository-features

- **Owns:** RepositoryFeatureConfiguration.
- **Excludes:** Actions, Pages, Packages, SecurityScanning, WikiContent.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous); organizations/organization-policies via FeaturePolicyConstraints (synchronous); commerce/entitlements via FeatureEntitlement (synchronous)
- **Published events:** RepositoryFeatureEnabled@1 (domain), RepositoryFeatureDisabled@1 (domain), RepositoryFeatureConfigured@1 (domain)
- **Official sources:** repositories-repository-features-source-01 ([issues enablement, discussions enablement, projects linking](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository), verified unverified)

### repositories/repository-metadata

- **Owns:** RepositoryTopicSet, RepositorySocialPreview, RepositoryDisplayMetadata.
- **Excludes:** CustomPropertyDefinition, RepositoryPropertyValue, RepositoryContent.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous); organizations/custom-properties via RepositoryPropertyProjection (synchronous); platform/media-storage via MediaReference (synchronous)
- **Published events:** RepositoryTopicsChanged@1 (domain), RepositorySocialPreviewChanged@1 (domain), RepositorySocialPreviewRemoved@1 (domain), RepositoryDisplayMetadataChanged@1 (domain)
- **Official sources:** repositories-repository-metadata-source-01 ([topics, social preview, repository display metadata](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository), verified unverified)

### collaboration/issues

- **Owns:** Issue, SubIssueRelation, IssueDependency, IssueTransfer.
- **Excludes:** Comment, LabelDefinition, Project, PullRequest.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous); repositories/repository-access via RepositoryPermission (synchronous); repositories/repository-features via IssueFeatureState (synchronous); collaboration/issue-schema via IssueSchemaReference (synchronous); collaboration/labels-and-milestones via TaxonomyReference (synchronous)
- **Published events:** IssueCreated@1 (domain), IssueUpdated@1 (domain), IssueClosed@1 (domain), IssueReopened@1 (domain), IssueAssigned@1 (domain), IssueUnassigned@1 (domain), SubIssueAdded@1 (domain), SubIssueRemoved@1 (domain), IssueDependencyAdded@1 (domain), IssueDependencyRemoved@1 (domain), IssueTransferred@1 (domain)
- **Official sources:** collaboration-issues-source-01 ([issues, sub-issues, issue dependencies, issue metadata](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues), verified unverified)

### collaboration/issue-schema

- **Owns:** IssueTypeDefinition, IssueFieldDefinition, IssueFieldVisibility, IssueFieldValue.
- **Excludes:** ProjectField, CustomPropertyDefinition, Label.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); organizations/organization-policies via IssueSchemaPolicy (synchronous); commerce/entitlements via IssueSchemaEntitlement (synchronous)
- **Published events:** IssueTypeDefined@1 (domain), IssueTypeUpdated@1 (domain), IssueTypeRetired@1 (domain), IssueFieldDefined@1 (domain), IssueFieldUpdated@1 (domain), IssueFieldRetired@1 (domain), IssueFieldValueSet@1 (domain), IssueFieldValueCleared@1 (domain)
- **Official sources:** collaboration-issue-schema-source-01 ([issue fields, field visibility, organization-level issue metadata](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-issue-fields), verified unverified)

### collaboration/labels-and-milestones

- **Owns:** LabelCatalog, Label, Milestone.
- **Excludes:** Issue, Discussion, OrganizationDefaultLabelPolicy.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous)
- **Published events:** LabelCreated@1 (domain), LabelUpdated@1 (domain), LabelDeleted@1 (domain), MilestoneCreated@1 (domain), MilestoneUpdated@1 (domain), MilestoneClosed@1 (domain), MilestoneReopened@1 (domain), MilestoneDeleted@1 (domain)
- **Official sources:** collaboration-labels-and-milestones-source-01 ([labels, milestones, work classification](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work), verified unverified)

### collaboration/conversations

- **Owns:** Conversation, Comment, Reply, Reaction, Mention, CommentRevision.
- **Excludes:** IssueState, DiscussionCategory, ModerationCase, ArbitrarySubjectType.
- **Dependencies:** identity/accounts via ActorReference (synchronous)
- **Published events:** ConversationCreated@1 (domain), ConversationLocked@1 (domain), ConversationUnlocked@1 (domain), CommentAdded@1 (domain), CommentEdited@1 (domain), CommentDeleted@1 (domain), ReplyAdded@1 (domain), ReactionAdded@1 (domain), ReactionRemoved@1 (domain), MentionDetected@1 (domain)
- **Official sources:** collaboration-conversations-source-01 ([comments, mentions, reactions, conversation](https://docs.github.com/en/get-started/using-github/communicating-on-github), verified unverified)

### collaboration/discussions

- **Owns:** DiscussionSpace, Discussion, DiscussionCategory, DiscussionSection, DiscussionPoll, AcceptedAnswer, PinnedDiscussion.
- **Excludes:** Comment, LabelDefinition, Issue, TeamDiscussion.
- **Dependencies:** repositories/repositories via RepositoryReference (synchronous); organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via DiscussionPermission (synchronous); repositories/repository-features via DiscussionFeatureState (synchronous); collaboration/labels-and-milestones via LabelReference (synchronous); collaboration/conversations via DiscussionConversation (synchronous)
- **Published events:** DiscussionCreated@1 (domain), DiscussionUpdated@1 (domain), DiscussionClosed@1 (domain), DiscussionReopened@1 (domain), DiscussionTransferred@1 (domain), DiscussionCategoryCreated@1 (domain), DiscussionCategoryUpdated@1 (domain), DiscussionCategoryDeleted@1 (domain), DiscussionAnswerMarked@1 (domain), DiscussionAnswerUnmarked@1 (domain), DiscussionPinned@1 (domain), DiscussionUnpinned@1 (domain), DiscussionPollClosed@1 (domain)
- **Official sources:** collaboration-discussions-source-01 ([discussion spaces, categories, sections, polls](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions), verified unverified); collaboration-discussions-source-02 ([answers, pins, transfer, discussion lifecycle](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions), verified unverified)

### collaboration/moderation

- **Owns:** ContentReport, ModerationCase, InteractionLimit, OrganizationBlock, ContentVisibilityDecision.
- **Excludes:** CommentBody, IssueState, DiscussionState.
- **Dependencies:** organizations/organizations via OrganizationReference (synchronous); repositories/repository-access via ModerationPermission (synchronous); collaboration/issues via IssueModerationTarget (synchronous); collaboration/conversations via ConversationModerationTarget (synchronous); collaboration/discussions via DiscussionModerationTarget (synchronous)
- **Published events:** ContentReported@1 (domain), ContentReportResolved@1 (domain), ContentReportReopened@1 (domain), InteractionLimitSet@1 (domain), InteractionLimitLifted@1 (domain), OrganizationBlocked@1 (domain), OrganizationUnblocked@1 (domain), ContentHidden@1 (domain), ContentUnhidden@1 (domain)
- **Official sources:** collaboration-moderation-source-01 ([content moderation, interaction limits, blocking, conversation locking](https://docs.github.com/en/communities/moderating-comments-and-conversations), verified unverified)

### collaboration/projects

- **Owns:** Project, ProjectItem, DraftIssue, ProjectView, ProjectField, ProjectWorkflow, ProjectChart, ProjectTemplate, ProjectStatusUpdate.
- **Excludes:** RepositoryOwnership, Issue, IssueFieldDefinition.
- **Dependencies:** identity/accounts via UserProjectOwner (synchronous); organizations/organizations via OrganizationProjectOwner (synchronous); organizations/organization-policies via ProjectPolicy (synchronous); collaboration/issues via IssueProjectItem (synchronous); commerce/entitlements via ProjectEntitlement (synchronous)
- **Published events:** ProjectCreated@1 (domain), ProjectUpdated@1 (domain), ProjectClosed@1 (domain), ProjectReopened@1 (domain), ProjectDeleted@1 (domain), ProjectItemAdded@1 (domain), ProjectItemUpdated@1 (domain), ProjectItemRemoved@1 (domain), ProjectViewChanged@1 (domain), ProjectFieldChanged@1 (domain), ProjectWorkflowChanged@1 (domain), ProjectStatusUpdated@1 (domain)
- **Official sources:** collaboration-projects-source-01 ([projects, views, fields, workflows, charts, templates](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects), verified unverified)

### engagement/stars

- **Owns:** RepositoryStar, StarList, StarListEntry.
- **Excludes:** RepositorySubscription, Notification, UserFollow.
- **Dependencies:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryReference (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous)
- **Published events:** RepositoryStarred@1 (domain), RepositoryUnstarred@1 (domain), StarListCreated@1 (domain), StarListUpdated@1 (domain), StarListDeleted@1 (domain), StarListEntryAdded@1 (domain), StarListEntryRemoved@1 (domain)
- **Official sources:** engagement-stars-source-01 ([repository stars, star lists, discovery](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars), verified unverified)

### engagement/subscriptions

- **Owns:** RepositorySubscription, ConversationSubscription, SubscriptionReason.
- **Excludes:** Notification, EmailDelivery, RepositoryStar.
- **Dependencies:** identity/accounts via AccountReference (synchronous); repositories/repositories via RepositoryReference (synchronous); repositories/repository-access via RepositoryReadPermission (synchronous); collaboration/conversations via ConversationReference (synchronous)
- **Published events:** RepositorySubscriptionChanged@1 (domain), ConversationSubscriptionChanged@1 (domain)
- **Official sources:** engagement-subscriptions-source-01 ([repository subscriptions, conversation subscriptions, watch preferences](https://docs.github.com/en/subscriptions-and-notifications), verified unverified)

### engagement/notifications

- **Owns:** Notification, NotificationInbox, NotificationReason, NotificationState, InboxFilter.
- **Excludes:** SubscriptionPreference, EmailDelivery, PushDelivery.
- **Dependencies:** identity/accounts via NotificationRecipient (synchronous); engagement/subscriptions via NotificationInterestDecision (synchronous); platform/notification-channels via NotificationChannel (synchronous)
- **Published events:** NotificationCreated@1 (domain), NotificationRead@1 (domain), NotificationUnread@1 (domain), NotificationSaved@1 (domain), NotificationUnsaved@1 (domain), NotificationDone@1 (domain), NotificationReopened@1 (domain), InboxFilterChanged@1 (domain)
- **Official sources:** engagement-notifications-source-01 ([notification inbox, notification reasons, read state, saved state, done state](https://docs.github.com/en/subscriptions-and-notifications), verified unverified)

### integrations/app-registrations

- **Owns:** AppRegistration, AppOwnerReference, AppPermissionRequest, AppWebhookConfiguration.
- **Excludes:** AppInstallation, UserAuthorization, WebhookDelivery.
- **Dependencies:** identity/accounts via UserAppOwner (synchronous); organizations/organizations via OrganizationAppOwner (synchronous); enterprises/enterprises via EnterpriseAppOwner (synchronous); commerce/entitlements via AppEntitlement (synchronous)
- **Published events:** AppRegistered@1 (domain), AppUpdated@1 (domain), AppSuspended@1 (domain), AppDeleted@1 (domain), AppPermissionsChanged@1 (domain), AppWebhookConfigurationChanged@1 (domain)
- **Official sources:** integrations-app-registrations-source-01 ([app registration, app ownership, app permissions, app visibility](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app), verified unverified)

### integrations/app-installations

- **Owns:** AppInstallation, InstallationTargetReference, InstallationRepositorySelection, InstallationPermissionGrant.
- **Excludes:** AppRegistration, OAuthAuthorization, RepositoryGrant.
- **Dependencies:** integrations/app-registrations via AppRegistrationReference (synchronous); identity/accounts via UserInstallationTarget (synchronous); organizations/organizations via OrganizationInstallationTarget (synchronous); repositories/repositories via InstallationRepositoryReference (synchronous); repositories/repository-access via InstallationPermission (synchronous)
- **Published events:** AppInstalled@1 (domain), AppSuspended@1 (domain), AppUnsuspended@1 (domain), AppUninstalled@1 (domain), InstallationRepositorySelectionChanged@1 (domain), InstallationPermissionsChanged@1 (domain)
- **Official sources:** integrations-app-installations-source-01 ([app installation, installation targets, repository selection, installation lifecycle](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app), verified unverified)

### integrations/oauth-authorizations

- **Owns:** OAuthClient, OAuthAuthorization, AuthorizationScope, AuthorizationRevocation.
- **Excludes:** GitHubAppInstallation, InteractiveSession, TokenStorageAdapter.
- **Dependencies:** integrations/app-registrations via ApplicationReference (synchronous); identity/accounts via AuthorizingUserReference (synchronous); organizations/organization-policies via OAuthPolicyConstraints (synchronous)
- **Published events:** OAuthClientRegistered@1 (domain), OAuthClientUpdated@1 (domain), OAuthClientDeleted@1 (domain), OAuthAuthorizationGranted@1 (domain), OAuthAuthorizationRevoked@1 (domain), OAuthScopesChanged@1 (domain)
- **Official sources:** integrations-oauth-authorizations-source-01 ([OAuth apps, user authorization, scopes, revocation](https://docs.github.com/en/apps/oauth-apps), verified unverified)

### integrations/webhooks

- **Owns:** Webhook, WebhookEventSelection, WebhookSecretReference, WebhookDelivery, WebhookDeliveryAttempt.
- **Excludes:** DomainEvent, ArbitraryDatabasePolling, RawSecretStorage.
- **Dependencies:** integrations/app-registrations via AppWebhookReference (synchronous); integrations/app-installations via InstallationWebhookScope (synchronous); repositories/repositories via RepositoryWebhookTarget (synchronous); organizations/organizations via OrganizationWebhookTarget (synchronous); enterprises/enterprises via EnterpriseWebhookTarget (synchronous); platform/event-publication via IntegrationEventTransport (synchronous); organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; repositories/repositories via PublishedEventContract (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1]; collaboration/issues via PublishedEventContract (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via PublishedEventContract (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via PublishedEventContract (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1]; engagement/stars via PublishedEventContract (event) [RepositoryStarred@1, RepositoryUnstarred@1]; integrations/app-installations via PublishedEventContract (event) [AppInstalled@1, AppSuspended@1, AppUnsuspended@1, AppUninstalled@1]
- **Published events:** WebhookCreated@1 (domain), WebhookUpdated@1 (domain), WebhookDeleted@1 (domain), WebhookDeliveryQueued@1 (domain), WebhookDeliverySucceeded@1 (domain), WebhookDeliveryFailed@1 (domain), WebhookRedelivered@1 (domain)
- **Official sources:** integrations-webhooks-source-01 ([webhook events, payloads, webhook types](https://docs.github.com/en/webhooks/webhook-events-and-payloads), verified unverified); integrations-webhooks-source-02 ([deliveries, attempts, redelivery](https://docs.github.com/en/webhooks/testing-and-troubleshooting-webhooks/viewing-webhook-deliveries), verified unverified)

### commerce/billing

- **Owns:** BillingAccount, PaymentProfile, UsageRecord, Budget, CostCenter, Invoice.
- **Excludes:** FeatureEntitlement, LicenseAssignment, PaymentProviderRecord.
- **Dependencies:** identity/accounts via PersonalBillingOwner (synchronous); organizations/organizations via OrganizationBillingOwner (synchronous); enterprises/enterprises via EnterpriseBillingOwner (synchronous)
- **Published events:** BillingAccountCreated@1 (domain), BillingAccountUpdated@1 (domain), PaymentProfileUpdated@1 (domain), UsageRecorded@1 (domain), BudgetCreated@1 (domain), BudgetUpdated@1 (domain), BudgetExceeded@1 (domain), CostCenterCreated@1 (domain), CostCenterUpdated@1 (domain), CostCenterDeleted@1 (domain), InvoiceIssued@1 (domain), InvoicePaid@1 (domain)
- **Official sources:** commerce-billing-source-01 ([billing accounts, usage, budgets, cost centers](https://docs.github.com/en/billing/get-started/introduction-to-billing), verified unverified)

### commerce/entitlements

- **Owns:** Plan, FeatureEntitlement, License, LicenseAssignment, UsageLimit.
- **Excludes:** Invoice, OrganizationMembership, EnterpriseRole.
- **Dependencies:** commerce/billing via BillingStanding (synchronous); identity/accounts via UserEntitlementOwner (synchronous); organizations/organizations via OrganizationEntitlementOwner (synchronous); enterprises/enterprises via EnterpriseEntitlementOwner (synchronous)
- **Published events:** PlanChanged@1 (domain), EntitlementGranted@1 (domain), EntitlementRevoked@1 (domain), LicenseAssigned@1 (domain), LicenseRevoked@1 (domain), UsageLimitReached@1 (domain)
- **Official sources:** commerce-entitlements-source-01 ([plans, licenses, license assignment, usage limits](https://docs.github.com/en/billing/how-tos/manage-plan-and-licenses), verified unverified)

### governance/audit-logs

- **Owns:** AuditEvent, AuditScope, AuditActor, AuditTarget, AuditExport, AuditRetentionPolicy.
- **Excludes:** ProductActivityFeed, StorageRecord, ArbitraryApplicationLog.
- **Dependencies:** organizations/organizations via OrganizationAuditScope (synchronous); enterprises/enterprises via EnterpriseAuditScope (synchronous); platform/event-publication via AuditEventTransport (synchronous); platform/audit-storage via AuditStoragePort (synchronous); identity/accounts via PublishedEventContract (event) [AccountSuspended@1, AccountReinstated@1, AccountDeleted@1]; enterprises/enterprise-memberships via PublishedEventContract (event) [EnterpriseMemberAdded@1, EnterpriseMemberRemoved@1, EnterpriseAffiliationChanged@1]; enterprises/enterprise-roles via PublishedEventContract (event) [EnterpriseRoleDefined@1, EnterpriseRoleUpdated@1, EnterpriseRoleDeleted@1, EnterpriseRoleAssigned@1, EnterpriseRoleRevoked@1]; enterprises/enterprise-iam via PublishedEventContract (event) [IdentityProviderConfigured@1, ProvisionedIdentityCreated@1, ProvisionedIdentitySuspended@1, ProvisionedIdentityReinstated@1, ProvisionedIdentityDeprovisioned@1]; enterprises/enterprise-policies via PublishedEventContract (event) [EnterprisePolicyChanged@1, EnterprisePolicyEnforcementChanged@1, OrganizationPolicyOverrideChanged@1]; organizations/organization-memberships via PublishedEventContract (event) [OrganizationMemberAdded@1, OrganizationMemberRemoved@1, OrganizationMemberRoleChanged@1]; organizations/organization-teams via PublishedEventContract (event) [OrganizationTeamCreated@1, OrganizationTeamUpdated@1, OrganizationTeamDeleted@1, TeamMemberAdded@1, TeamMemberRemoved@1, TeamMaintainerChanged@1]; organizations/organization-roles via PublishedEventContract (event) [OrganizationRoleDefined@1, OrganizationRoleUpdated@1, OrganizationRoleDeleted@1, OrganizationRoleAssigned@1, OrganizationRoleRevoked@1, CustomRepositoryRoleDefined@1, CustomRepositoryRoleUpdated@1, CustomRepositoryRoleDeleted@1]; organizations/organization-policies via PublishedEventContract (event) [OrganizationPolicyChanged@1, BaseRepositoryPermissionChanged@1]; organizations/custom-properties via PublishedEventContract (event) [CustomPropertyDefined@1, CustomPropertyUpdated@1, CustomPropertyDeleted@1, RepositoryPropertyValueSet@1, RepositoryPropertyValueCleared@1]; repositories/repositories via PublishedEventContract (event) [RepositoryVisibilityChanged@1, RepositoryTransferred@1, RepositoryArchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via PublishedEventContract (event) [RepositoryAccessGranted@1, RepositoryAccessChanged@1, RepositoryAccessRevoked@1, OutsideCollaboratorAccessGranted@1, OutsideCollaboratorAccessRevoked@1]; integrations/app-registrations via PublishedEventContract (event) [AppRegistered@1, AppUpdated@1, AppSuspended@1, AppDeleted@1, AppPermissionsChanged@1]; integrations/app-installations via PublishedEventContract (event) [AppInstalled@1, AppSuspended@1, AppUnsuspended@1, AppUninstalled@1, InstallationPermissionsChanged@1]; integrations/oauth-authorizations via PublishedEventContract (event) [OAuthClientRegistered@1, OAuthClientUpdated@1, OAuthClientDeleted@1, OAuthAuthorizationGranted@1, OAuthAuthorizationRevoked@1, OAuthScopesChanged@1]; integrations/webhooks via PublishedEventContract (event) [WebhookCreated@1, WebhookUpdated@1, WebhookDeleted@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; commerce/billing via PublishedEventContract (event) [BillingAccountUpdated@1, PaymentProfileUpdated@1, BudgetCreated@1, BudgetUpdated@1, BudgetExceeded@1, CostCenterCreated@1, CostCenterUpdated@1, CostCenterDeleted@1]; commerce/entitlements via PublishedEventContract (event) [PlanChanged@1, EntitlementGranted@1, EntitlementRevoked@1, LicenseAssigned@1, LicenseRevoked@1, UsageLimitReached@1]
- **Published events:** AuditEventRecorded@1 (domain), AuditExportRequested@1 (domain), AuditExportCompleted@1 (domain), AuditExportFailed@1 (domain), AuditRetentionPolicyChanged@1 (domain)
- **Official sources:** governance-audit-logs-source-01 ([enterprise audit log, audit search, audit export, audit streaming](https://docs.github.com/en/enterprise-cloud@latest/admin/monitoring-activity-in-your-enterprise), verified unverified)

### projections/search

- **Owns:** SearchDocument, SearchResultProjection.
- **Excludes:** SourceAggregate, AuthorizationSourceOfTruth, CodeSearch.
- **Dependencies:** identity/accounts via AccountSearchEvents (event) [AccountCreated@1, UsernameChanged@1, AccountDeleted@1]; organizations/organizations via OrganizationSearchEvents (event) [OrganizationCreated@1, OrganizationRenamed@1, OrganizationLifecycleChanged@1]; repositories/repositories via RepositorySearchEvents (event) [RepositoryCreated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1, RepositoryDeleted@1, RepositoryRestored@1]; repositories/repository-access via EffectiveReadPermission (synchronous); collaboration/issues via IssueSearchEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1, IssueTransferred@1]; collaboration/discussions via DiscussionSearchEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1, DiscussionTransferred@1]; collaboration/projects via ProjectSearchEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectDeleted@1]; platform/search-index via SearchIndexPort (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-search-source-01 ([global search, repository search, issue search, permission-filtered results](https://docs.github.com/en/search-github), verified unverified)

### projections/activity-feed

- **Owns:** ActivityItem, PersonalActivityFeed, RepositoryActivityFeed, OrganizationActivityFeed.
- **Excludes:** AuditEvent, DomainEventSource, CodeActivity.
- **Dependencies:** identity/social-graph via FollowEvents (event) [UserFollowed@1, UserUnfollowed@1, OrganizationFollowed@1, OrganizationUnfollowed@1]; repositories/repositories via RepositoryActivityEvents (event) [RepositoryCreated@1, RepositoryProfileUpdated@1, RepositoryRenamed@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1]; collaboration/issues via IssueActivityEvents (event) [IssueCreated@1, IssueUpdated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionActivityEvents (event) [DiscussionCreated@1, DiscussionUpdated@1, DiscussionClosed@1, DiscussionReopened@1]; collaboration/projects via ProjectActivityEvents (event) [ProjectCreated@1, ProjectUpdated@1, ProjectClosed@1, ProjectReopened@1, ProjectStatusUpdated@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-activity-feed-source-01 ([personal dashboard, activity feed, followed activity](https://docs.github.com/en/account-and-profile/concepts/personal-dashboard), verified unverified)

### projections/repository-insights

- **Owns:** RepositoryInsight, EngagementMetric, TrafficMetric, IntegrationHealthMetric.
- **Excludes:** GitActivityMetric, ContributorCodeMetric, SourceAggregate.
- **Dependencies:** repositories/repositories via RepositoryInsightEvents (event) [RepositoryCreated@1, RepositoryVisibilityChanged@1, RepositoryArchived@1, RepositoryUnarchived@1]; collaboration/issues via IssueMetricEvents (event) [IssueCreated@1, IssueClosed@1, IssueReopened@1]; collaboration/discussions via DiscussionMetricEvents (event) [DiscussionCreated@1, DiscussionClosed@1, DiscussionReopened@1]; engagement/stars via StarMetricEvents (event) [RepositoryStarred@1, RepositoryUnstarred@1]; engagement/subscriptions via SubscriptionMetricEvents (event) [RepositorySubscriptionChanged@1, ConversationSubscriptionChanged@1]; integrations/webhooks via WebhookHealthEvents (event) [WebhookDeliverySucceeded@1, WebhookDeliveryFailed@1, WebhookRedelivered@1]; repositories/repository-access via EffectiveReadPermission (synchronous)
- **Published events:** None. Read-model context consumes versioned events and does not publish product facts.
- **Official sources:** projections-repository-insights-source-01 ([repository traffic, engagement statistics, repository activity data](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository), verified unverified)

### platform/event-publication

- **Owns:** OutboxRecord, PublicationAttempt, IdempotencyKey, DeadLetterRecord.
- **Excludes:** ProductEventMeaning, WebhookSubscription, NotificationInterest.
- **Dependencies:** None.
- **Published events:** IntegrationEventPublished@1 (technical), EventPublicationFailed@1 (technical), EventDeadLettered@1 (technical), EventRedelivered@1 (technical)
- **Official sources:** Not applicable; technical capability.

### platform/search-index

- **Owns:** IndexDocument, IndexCursor, IndexOperation.
- **Excludes:** SearchSemantics, AuthorizationDecision, SourceAggregate.
- **Dependencies:** None.
- **Published events:** SearchDocumentUpserted@1 (technical), SearchDocumentRemoved@1 (technical), SearchIndexRebuilt@1 (technical)
- **Official sources:** Not applicable; technical capability.

### platform/media-storage

- **Owns:** MediaReference, MediaObject, MediaStoragePolicy.
- **Excludes:** RepositoryContent, ReleaseAsset, ProductVisibilityRule.
- **Dependencies:** None.
- **Published events:** MediaStored@1 (technical), MediaDeleted@1 (technical), MediaQuarantined@1 (technical)
- **Official sources:** Not applicable; technical capability.

### platform/notification-channels

- **Owns:** ChannelDelivery, DeliveryAttempt, DeliveryProviderReference.
- **Excludes:** Notification, SubscriptionPreference, RecipientSelection.
- **Dependencies:** None.
- **Published events:** ChannelDeliveryRequested@1 (technical), ChannelDeliverySucceeded@1 (technical), ChannelDeliveryFailed@1 (technical)
- **Official sources:** Not applicable; technical capability.

### platform/audit-storage

- **Owns:** AuditStorageRecord, AuditExportJob, RetentionExecution.
- **Excludes:** AuditEventMeaning, AuditAuthorization, ProductActivityFeed.
- **Dependencies:** None.
- **Published events:** AuditRecordStored@1 (technical), AuditStorageExportCompleted@1 (technical), AuditRetentionApplied@1 (technical)
- **Official sources:** Not applicable; technical capability.

All product semantics are justified by HTTPS sources under docs.github.com/en/.
Planned contexts do not receive source directories until implementation begins.
