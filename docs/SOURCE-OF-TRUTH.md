# Documentation Sources of Truth

This document defines how documentation authority is assigned and how conflicts
are resolved. It governs documentation ownership only; it does not replace any
product, architecture, route, data, or delivery contract.

## Authority matrix

| Concern | Authoritative source | Notes |
| --- | --- | --- |
| Repository-wide engineering guidance | [`../AGENTS.md`](../AGENTS.md) | Nested `AGENTS.md` files add path-local instructions only. |
| Change, review, commit, and merge workflow | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) | Documentation must change with the behavior or contract it describes. |
| Human-readable technical architecture | [`architecture/architecture.md`](architecture/architecture.md) | Resolves semantic architecture conflicts. |
| Machine-enforced architecture policy | [`../packages/tooling/src/architecture/policy.mjs`](../packages/tooling/src/architecture/policy.mjs) | Owns registered `ARCH-*` rules and enforcement metadata. |
| Bounded-context catalog | [`architecture/module-map.json`](architecture/module-map.json) | Owns context status, ownership, dependencies, and activation data. |
| Generated context projection | [`architecture/module-map.md`](architecture/module-map.md) | Generated from `module-map.json`; never edited directly. |
| Application route contract | [`../apps/web/route-map.json`](../apps/web/route-map.json) | Owns route identifiers, paths, and generated route documentation. |
| GitHub non-code product evidence and semantics | [`github-non-code/README.md`](github-non-code/README.md) and its [`source-register.md`](github-non-code/source-register.md) | The atlas owns registered evidence and logical semantics; it is not a physical schema. |
| Database-design handoff | [`architecture/data-model/README.md`](architecture/data-model/README.md) | Owns resolved logical-to-physical disposition for active and planned contexts. |
| Desired physical database state | [`../supabase/schemas/`](../supabase/schemas/) | Owns declarative SQL; migrations are immutable history. |
| Top-level documentation inventory | [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) | Owns the registered governance-document set and its relationships. |
| Documentation metadata fields | [`SCHEMA.md`](SCHEMA.md) | Defines the logical record shape used by the document map and logs. |
| Documentation vocabulary | [`CLASSIFICATION.md`](CLASSIFICATION.md) | Owns class, authority, and lifecycle values. |
| Documentation lifecycle | [`WORKFLOWS.md`](WORKFLOWS.md) | Owns create, change, replace, deprecate, and archive workflows. |
| Documentation validation | [`VALIDATION.md`](VALIDATION.md) | Owns the documentation-specific verification checklist. |

The three external-source registries are scoped rather than interchangeable.
The atlas source register owns evidence for the product-semantics model;
`module-map.json` records evidence supporting one bounded context's catalog
claims; and `route-map.json` records evidence supporting GitHub URL and
navigation compatibility. A URL may appear in more than one registry only when
each owner states its distinct supported claim. Source IDs and verification
dates remain local to their owning registry and must not be copied across
scopes as if they were one record.

## Conflict resolution

1. Identify the concern being decided; similar filenames do not imply shared
   authority.
2. Use the authority in the matrix for that concern.
3. Treat indexes, examples, FAQ answers, generated projections, and historical
   records as supporting material, not competing rules.
4. If two canonical sources appear to overlap, stop and clarify their
   responsibility boundaries. Do not silently choose the newer or more detailed
   text.
5. Correct the subordinate document and link to the canonical source. Change the
   canonical source only when its owned contract is intentionally changing.

An implemented file, route, or test is evidence of repository state, but its
existence does not override a declared architecture or catalog status. Likewise,
documentation does not prove that described behavior is implemented.

## Generated documents

Generated documents are projections of their declared inputs. Update the input
and run its owner generator; never repair the projection by hand. A generated
document may be authoritative for navigation or presentation only when its
source contract explicitly grants that role.

For this repository, `module-map.md` and generated route READMEs are examples of
projections. Their generation and validation rules remain owned by the existing
architecture automation.

## Evidence vocabulary

The terms **Confirmed**, **Derived**, and **Unresolved** belong to the integrated
GitHub non-code product-semantics model. General documentation must use the
lifecycle and authority vocabulary from
[`CLASSIFICATION.md`](CLASSIFICATION.md) instead of borrowing those evidence
labels.

## Legacy embedded GitHub product source projection

### Authority and verification

This section is a compatibility projection retained until the top-level
governance documents can remove the duplicated rows without breaking their
existing validation baseline. The canonical records are in
[`github-non-code/source-register.md`](github-non-code/source-register.md).
Every entry is an HTTPS page under `docs.github.com`.
The register was reviewed on 2026-07-29; repository sources used by the active
repository shell, dashboard, access, archive, delete, and restore slice were
reverified on 2026-07-30. This migration preserves those recorded verification
dates and does not claim a new external-source review.

GitHub plan, account type, preview status, and deployment variant remain part of
the supported semantic claim when the source makes them material.

| ID | Official GitHub Docs source | Supported semantics |
| --- | --- | --- |
| GH-AUTH-001 | [Creating an account on GitHub](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github) | Personal account identity, signup, and email verification. |
| GH-AUTH-002 | [About authentication to GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github) | Browser authentication, passkeys, 2FA, SAML, IdP, and session boundary. |
| GH-ACCOUNT-001 | [Personal account management](https://docs.github.com/en/account-and-profile/concepts/account-management) | Account deletion effects, ownership prerequisites, and ghost-user attribution. |
| GH-PROFILE-001 | [About your profile](https://docs.github.com/en/account-and-profile/concepts/personal-profile) | Profile elements, privacy, and social-visibility effects. |
| GH-DASH-001 | [Personal dashboard](https://docs.github.com/en/account-and-profile/reference/personal-dashboard) | Recent activity, top repositories, feed inputs, and preview boundaries. |
| GH-ENTERPRISE-001 | [Abilities of roles in an enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-roles-in-your-enterprise/abilities-of-roles) | Enterprise roles, organization separation, users, and guest collaborators. |
| GH-ENTERPRISE-002 | [Governing how people use repositories in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-repositories-in-your-enterprise/governing-how-people-use-repositories-in-your-enterprise) | Additive repository policy, targeting, restrictions, and bypass. |
| GH-ORG-001 | [Roles in an organization](https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/roles-in-an-organization) | Permissions, predefined/custom roles, owners, members, moderators, and outside collaborators. |
| GH-ORG-002 | [Inviting users to join your organization](https://docs.github.com/en/organizations/managing-membership-in-your-organization/inviting-users-to-join-your-organization) | Invitation actors, target identity, expiry, account and 2FA constraints, role, and optional team. |
| GH-ORG-003 | [Managing membership in your organization](https://docs.github.com/en/organizations/managing-membership-in-your-organization) | Invite, remove, and reinstate membership capabilities. |
| GH-TEAM-001 | [About organization teams](https://docs.github.com/en/organizations/organizing-members-into-teams/about-teams) | Organization-member-only teams, visibility, maintainers, nesting, cascading access, and mentions. |
| GH-TEAM-002 | [Removing organization members from a team](https://docs.github.com/en/organizations/organizing-members-into-teams/removing-organization-members-from-a-team) | Team removal effects on repository access and assignments. |
| GH-REPO-001 | [About repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories) | Repository ownership, permission-controlled access, and visibility. |
| GH-REPO-002 | [Repository roles for an organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization) | Read, triage, write, maintain, and admin roles. |
| GH-REPO-003 | [Managing teams and people with access to your repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-teams-and-people-with-access-to-your-repository) | Repository access principals, role changes, invitations, and removal. |
| GH-REPO-004 | [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility) | Public/private/internal visibility and metadata side effects. |
| GH-REPO-005 | [Archiving repositories](https://docs.github.com/en/repositories/archiving-a-github-repository/archiving-repositories) | Read-only archive state, unarchive, and mutation restrictions. |
| GH-REPO-006 | [Transferring a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository) | Transfer prerequisites, personal-account acceptance, retained metadata, and assignment reconciliation. |
| GH-REPO-007 | [Deleting a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/deleting-a-repository) | Deletion authority, policy restriction, confirmation, and team-permission loss. |
| GH-REPO-008 | [Restoring a deleted repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/restoring-a-deleted-repository) | Restoration actors, 90-day eligibility, delay, and non-restored team permissions. |
| GH-REPO-009 | [Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository) | Owner selection, name, description, visibility, and sufficient-owner-permission creation flow. |
| GH-REPO-010 | [Viewing all repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/viewing-all-your-repositories) | Repository dashboard discovery, search, filtering, sorting, and creation entrypoint. |
| GH-REPO-011 | [Renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository) | Rename authority and preservation of repository-scoped Issues, stars, and follower relationships. |
| GH-ISSUE-001 | [About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues) | Issue purpose, sub-issues, dependencies, metadata, assignment, subscription, and issue/discussion distinction. |
| GH-ISSUE-002 | [Closing an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/administering-issues/closing-an-issue) | Close authority and completed/not-planned reasons. |
| GH-COMMUNITY-001 | [Locking conversations](https://docs.github.com/en/communities/moderating-comments-and-conversations/locking-conversations) | Lock/unlock authority, reasons, timeline event, and mutation limits. |
| GH-DISCUSSION-001 | [Managing categories for discussions](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions) | Repository/organization discussions, source repository, categories, sections, and formats. |
| GH-DISCUSSION-002 | [Managing discussions](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions) | Category changes, pinning, transfer, deletion, closure, and creation of issues. |
| GH-DISCUSSION-003 | [Moderating discussions](https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions) | Triage-level moderation, answers, locks, issue conversion, and blocking. |
| GH-PROJECT-001 | [About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) | User/organization ownership, items, views, layouts, fields, insights, templates, updates, and automation. |
| GH-PROJECT-002 | [Managing visibility of your projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-your-project/managing-visibility-of-your-projects) | Public/private project visibility and item-level repository visibility. |
| GH-PROJECT-003 | [Closing and deleting your projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-your-project/closing-and-deleting-your-projects) | Project close, reopen, and permanent deletion. |
| GH-PROJECT-004 | [Archiving items from your project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/archiving-items-from-your-project) | Project-item archive, restore, and delete. |
| GH-NOTIFICATION-001 | [Configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications) | Delivery channels, watching, participation, event customization, and limits. |
| GH-NOTIFICATION-002 | [Managing notifications from your inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox) | Read/unread, saved, done, unsubscribe, filtering, and retention behavior. |
| GH-STAR-001 | [Saving repositories with stars](https://docs.github.com/en/get-started/exploring-projects-on-github/saving-repositories-with-stars) | Star semantics, lists, discovery, appreciation, and ranking inputs. |
| GH-FOLLOW-001 | [Following people](https://docs.github.com/en/get-started/exploring-projects-on-github/following-people) | Follow graph and dashboard/discovery effects. |
| GH-SEARCH-001 | [About searching on GitHub](https://docs.github.com/en/search-github/getting-started-with-searching-on-github/about-searching-on-github) | Global/scoped search, suggestions, filtering, searchable resource types, and indexing boundary. |
| GH-MODERATION-001 | [Reporting abuse or spam](https://docs.github.com/en/communities/maintaining-your-safety-on-github/reporting-abuse-or-spam) | Reportable actors, resources, and GitHub/maintainer reporting paths. |
| GH-MODERATION-002 | [Managing disruptive comments](https://docs.github.com/en/enterprise-cloud@latest/communities/moderating-comments-and-conversations/managing-disruptive-comments) | Hide, unhide, edit, redact, and delete moderation actions. |
| GH-AUDIT-001 | [Reviewing the audit log for your organization](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization) | Audit authority, event facts, search, retention window, API, and export. |

### Evidence rules

- A requirement may cite several source IDs; none may be replaced by an
  implementation assumption.
- Preview behavior remains marked preview and must not become a stable invariant
  without re-verification.
- A source that becomes unavailable or materially changes invalidates the
  affected requirement until it is reviewed again.
- Implementation details inferred by architecture and sequence diagrams are
  design choices, not claims about GitHub internals.
