# Requirements Traceability

Authority: [`source-register.md`](source-register.md). Verification: each
requirement must map to official evidence, a model owner, and future acceptance
tests before implementation.

```mermaid
requirementDiagram
    requirement Boundary {
        id: SCOPE-001
        text: Preserve GitHub collaboration semantics while excluding Git and code workflows
        risk: high
        verifymethod: inspection
    }
    functionalRequirement Accounts {
        id: ACT-001
        text: Personal account authentication profile and dashboard
        risk: medium
        verifymethod: analysis
    }
    functionalRequirement Governance {
        id: GOV-001
        text: Enterprise organization team role and policy governance
        risk: high
        verifymethod: analysis
    }
    functionalRequirement Collaboration {
        id: COL-001
        text: Repository shell issues discussions and projects
        risk: high
        verifymethod: test
    }
    functionalRequirement Engagement {
        id: ENG-001
        text: Notifications subscriptions stars follows activity and search
        risk: medium
        verifymethod: test
    }
    functionalRequirement Safety {
        id: SAFE-001
        text: Moderation blocking reporting interaction limits and audit
        risk: high
        verifymethod: test
    }
    element AccountProfile {
        type: bounded-context
        docref: docs/github-non-code/source-register.md
    }
    element GovernanceModel {
        type: bounded-context
        docref: docs/github-non-code/source-register.md
    }
    element CollaborationModel {
        type: bounded-context
        docref: docs/github-non-code/source-register.md
    }
    element EngagementModel {
        type: bounded-context
        docref: docs/github-non-code/source-register.md
    }
    element TrustModel {
        type: bounded-context
        docref: docs/github-non-code/source-register.md
    }

    Boundary - contains -> Accounts
    Boundary - contains -> Governance
    Boundary - contains -> Collaboration
    Boundary - contains -> Engagement
    Boundary - contains -> Safety
    AccountProfile - satisfies -> Accounts
    GovernanceModel - satisfies -> Governance
    CollaborationModel - satisfies -> Collaboration
    EngagementModel - satisfies -> Engagement
    TrustModel - satisfies -> Safety
```

| Requirement | Confirmed obligation | Evidence | Future acceptance focus |
| --- | --- | --- | --- |
| SCOPE-001 | Retain only non-code collaboration semantics named by this atlas. | Task boundary; all registered sources | Excluded capabilities have no routes, commands, storage, or navigation. |
| ACT-001 | A personal account is the user identity; authentication, profile privacy, and dashboard visibility are distinct concerns. | GH-AUTH-001, GH-AUTH-002, GH-ACCOUNT-001, GH-PROFILE-001, GH-DASH-001 | Signup/verification, sign-in boundaries, private-profile visibility, deletion prerequisites. |
| GOV-001 | Permissions come from scoped roles, memberships, teams, direct grants, and additive policy constraints. | GH-ENTERPRISE-001, GH-ENTERPRISE-002, GH-ORG-001, GH-ORG-002, GH-TEAM-001, GH-REPO-002 | Role combinations, nested teams, invitation eligibility, policy restriction and bypass. |
| COL-001 | A repository is the discoverable collaboration owner shell for Issues and Discussions, while Projects may be user- or organization-owned. | GH-REPO-001 through GH-REPO-011, GH-ISSUE-001, GH-ISSUE-002, GH-DISCUSSION-001 through GH-DISCUSSION-003, GH-PROJECT-001 through GH-PROJECT-004 | Searchable visible-repository lists; owner-authorized creation; shared repository navigation; denial-safe not-found; archived read-only views; deleted-repository restoration under personal or organization settings; ownership, visibility, lifecycle, metadata reconciliation, and forbidden transitions. |
| ENG-001 | Watching/participation creates subscriptions; notifications expose reason plus independent read and triage choices; stars/follows influence discovery. | GH-NOTIFICATION-001, GH-NOTIFICATION-002, GH-STAR-001, GH-FOLLOW-001, GH-SEARCH-001 | Subscription sources, delivery choice, inbox triage, visibility-safe discovery and search. |
| SAFE-001 | Moderation and audit have separate actors, resources, actions, visibility, and retention rules. | GH-COMMUNITY-001, GH-MODERATION-001, GH-MODERATION-002, GH-AUDIT-001 | Lock/hide/report/block permissions, actor visibility, audit facts and export. |

## Repository capability matrix

`Evidence` records what GitHub Docs directly confirms. `Support status` records
this repository's current implementation boundary and does not promote a
deferred capability to an active architecture contract.

| Capability | Evidence | Support status | Trace and acceptance boundary |
| --- | --- | --- | --- |
| Repository dashboard, search, filters, sorting, and creation entrypoint | Confirmed | Active | GH-REPO-009, GH-REPO-010; authenticated dashboards return repositories visible to the actor, public owner/repository reads accept an anonymous principal, and empty-owner and no-match states remain distinct. |
| Personal or organization ownership, visibility, effective roles, and access sources | Confirmed | Active | GH-REPO-001 through GH-REPO-004; public resources may be read anonymously, private/internal discovery is permission-filtered, and denied lookup is indistinguishable from absence. |
| Rename, archive/unarchive, delete, and restore | Confirmed | Active | GH-REPO-005, GH-REPO-007, GH-REPO-008, GH-REPO-011; archived repositories remain readable but only Star remains mutable, deleted repositories leave normal navigation, and restore is owner-only within 90 days without restoring team grants. |
| Issues, Discussions, Projects, Activity, Stars, and Watchers in the repository shell | Confirmed | Active | GH-REPO-001, GH-REPO-005, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001, GH-NOTIFICATION-001, GH-STAR-001; tabs preserve repository context and direct navigation repeats authorization. |
| Repository transfer | Confirmed | Deferred | GH-REPO-006; record retained metadata and assignment reconciliation without activating routes, commands, or persistence. |
| Direct collaborator invitations and outside-collaborator workflows | Confirmed | Deferred | GH-REPO-003; the active Access view exposes existing direct/inherited team sources but does not activate invitation workflows. |
| Repository feature metadata, templates, forks, and releases | Unresolved or out of slice | Deferred | Preserve as a mapping gap; do not infer fields, navigation, or lifecycle behavior from GitHub resemblance. |
| Git content, commits, branches, pull requests, review, and Actions | Confirmed GitHub capabilities | Excluded | SCOPE-001; no routes, commands, storage, or repository tabs may activate these capabilities. |

### Current interaction observation (2026-07-30)

- **Confirmed:** GitHub documentation places repository discovery and creation
  at the repository dashboard, and repository-scoped collaboration under a
  shared repository identity and navigation shell.
- **Derived for Support:** the sidebar names resource collections only;
  `New` remains an index/header action. Public owner and repository views keep
  the same shell, while write controls require an authenticated principal and
  archived repositories explain their read-only state.
- **Deferred:** pixel-level parity, Git/Code surfaces, direct collaborators,
  transfer, forks, releases, and planned enterprise products are not inferred
  from the current GitHub website.
