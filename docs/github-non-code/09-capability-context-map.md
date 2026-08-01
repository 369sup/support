# Capability-to-Context Map

This is a derived, implementation-facing view of the atlas. Product semantics
still come from [`source-register.md`](source-register.md); context identity,
ownership, relationships, event contracts, and implementation status remain
authoritative only in
[`../architecture/module-map.json`](../architecture/module-map.json). This
file must be regenerated or revalidated when that catalog changes and must
never become a second hand-maintained catalog.

The status classes below were validated against catalog version 6 on
2026-08-02. An active context can still contain planned event contracts or
planned relationships; context status must not be used as a shortcut for
contract readiness.

```mermaid
flowchart LR
    classDef capability fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef active fill:#dafbe1,stroke:#1a7f37,color:#24292f
    classDef planned fill:#f6f8fa,stroke:#57606a,color:#24292f,stroke-dasharray:5 5
    classDef preview fill:#fbefff,stroke:#8250df,color:#24292f
    classDef technical fill:#ddf4ff,stroke:#0969da,color:#24292f

    subgraph Atlas["Atlas capabilities"]
        Accounts["Account, authentication and profile"]:::capability
        Governance["Enterprise and organization governance"]:::capability
        Repository["Repository shell and access"]:::capability
        Work["Issues, conversations, Discussions and Projects"]:::capability
        Engagement["Stars, subscriptions and notifications"]:::capability
        Discovery["Dashboard, activity, discovery and search"]:::capability
        Safety["Moderation and audit"]:::capability
    end

    subgraph Contexts["Canonical semantic contexts"]
        IAccounts["identity/accounts"]:::active
        IAuth["identity/authentication"]:::active
        IEmails["identity/account-emails"]:::active
        IRegistration["identity/account-registration"]:::active
        IProfiles["identity/profiles"]:::active
        ISocial["identity/social-graph"]:::active

        Enterprises["enterprises/enterprises"]:::active
        EnterpriseMemberships["enterprises/enterprise-memberships"]:::active
        EnterpriseTeams["enterprises/enterprise-teams (preview)"]:::preview
        EnterpriseRoles["enterprises/enterprise-roles"]:::active
        EnterprisePolicies["enterprises/enterprise-policies"]:::planned
        Organizations["organizations/organizations"]:::active
        OrganizationMemberships["organizations/organization-memberships"]:::active
        OrganizationTeams["organizations/organization-teams"]:::active
        OrganizationRoles["organizations/organization-roles"]:::active
        OrganizationPolicies["organizations/organization-policies"]:::active

        Repositories["repositories/repositories"]:::active
        RepositoryAccess["repositories/repository-access"]:::active
        RepositoryFeatures["repositories/repository-features"]:::planned

        Issues["collaboration/issues"]:::active
        IssueSchema["collaboration/issue-schema"]:::planned
        Conversations["collaboration/conversations"]:::active
        Discussions["collaboration/discussions"]:::active
        Projects["collaboration/projects"]:::active
        Moderation["collaboration/moderation"]:::active

        Stars["engagement/stars"]:::active
        Subscriptions["engagement/subscriptions"]:::active
        Notifications["engagement/notifications"]:::active
        Entitlements["commerce/entitlements"]:::planned
        AuditLogs["governance/audit-logs"]:::planned

        Search["projections/search"]:::active
        Dashboard["projections/dashboard"]:::active
        Activity["projections/activity-feed"]:::active
        Explore["projections/discovery"]:::active
    end

    Accounts --> IAccounts
    Accounts --> IAuth
    Accounts --> IEmails
    Accounts --> IRegistration
    Accounts --> IProfiles
    Accounts --> ISocial

    Governance --> Enterprises
    Governance --> EnterpriseMemberships
    Governance --> EnterpriseTeams
    Governance --> EnterpriseRoles
    Governance --> EnterprisePolicies
    Governance --> Organizations
    Governance --> OrganizationMemberships
    Governance --> OrganizationTeams
    Governance --> OrganizationRoles
    Governance --> OrganizationPolicies

    Repository --> Repositories
    Repository --> RepositoryAccess
    Repository --> RepositoryFeatures
    Work --> Issues
    Work --> IssueSchema
    Work --> Conversations
    Work --> Discussions
    Work --> Projects
    Engagement --> Stars
    Engagement --> Subscriptions
    Engagement --> Notifications
    Discovery --> Search
    Discovery --> Dashboard
    Discovery --> Activity
    Discovery --> Explore
    Safety --> Moderation
    Safety --> AuditLogs

    Issues -->|"sync decision"| RepositoryAccess
    Discussions -->|"sync decision"| RepositoryAccess
    Projects -->|"sync decision"| OrganizationPolicies
    Notifications -->|"sync read decision"| RepositoryAccess
    RepositoryAccess -->|"sync contributions"| OrganizationTeams
    RepositoryAccess -->|"sync restrictions"| OrganizationPolicies
    Issues -. "versioned events; eventual" .-> Notifications
    Conversations -. "versioned events; eventual" .-> Notifications
    Discussions -. "versioned events; eventual" .-> Notifications
    IAccounts -. "versioned events; eventual" .-> Search
    Repositories -. "versioned events; eventual" .-> Search
    Issues -. "versioned events; eventual" .-> Search
    Discussions -. "versioned events; eventual" .-> Search
    Projects -. "versioned events; eventual" .-> Search
    Repositories -. "versioned events; eventual" .-> Activity
    Engagement -. "interest and events; eventual" .-> Dashboard
    RepositoryFeatures -. "planned availability decision" .-> Entitlements
    Projects -. "planned availability decision" .-> Entitlements
    Issues -->|"sync safety guard"| Moderation
    Conversations -->|"sync safety guard"| Moderation
    Discussions -->|"sync safety guard"| Moderation

    subgraph Platform["Canonical technical contexts"]
        Publication["platform/event-publication"]:::technical
        SearchIndex["platform/search-index"]:::technical
        Channels["platform/notification-channels"]:::technical
        AuditStorage["platform/audit-storage"]:::technical
        Scheduler["platform/scheduled-commands"]:::technical
    end

    Contexts -. "context-owned outbox" .-> Publication
    Publication -. "redelivery" .-> Search
    Publication -. "redelivery" .-> Notifications
    Publication -. "redelivery" .-> AuditLogs
    Search --> SearchIndex
    Notifications --> Channels
    AuditLogs --> AuditStorage
    Scheduler -. "expiry or reconciliation command" .-> Contexts
```

## Ownership and readiness cross-check

| Atlas slice | Canonical owner set | Synchronous dependencies that remain authoritative | Eventual consumers | Material readiness gap |
| --- | --- | --- | --- | --- |
| Accounts and profiles | `identity/accounts`, `authentication`, `account-emails`, `account-registration`, `profiles` | Current account, session, email and profile decisions | Search, dashboard and activity projections | Provider-specific recovery and enrollment remain delivery contracts. |
| Enterprise and organization governance | Enterprise and organization membership, team, role and policy contexts | Principal affiliation, roles, team contribution and policy restriction | Audit and downstream discovery effects | `enterprise-policies` is planned; enterprise teams are active but preview. |
| Repository shell and access | `repositories/repositories`, `repository-access` | Lifecycle, visibility, effective permission and policy inputs | Search, activity, notification and audit consumers | `repository-features` and several lifecycle event contracts remain planned. |
| Issues and conversations | `collaboration/issues`, `conversations` | Repository read/mutation decision and object rules | Notifications, search, activity and audit | `issue-schema` and issue event contracts remain planned. |
| Discussions and Projects | `collaboration/discussions`, `projects` | Source-repository/project grants, organization policy and item visibility | Notifications, search, activity and audit | Source-repository disruption semantics and several event contracts remain unresolved or planned. |
| Engagement | `engagement/stars`, `subscriptions`, `notifications` | Subject visibility and recipient/interest decisions | Dashboard, discovery and external delivery | Delivery is a technical adapter; notification event contracts remain planned. |
| Moderation and audit | `collaboration/moderation`; planned `governance/audit-logs` | Active block/limit and resource moderation decisions | Relationship cleanup and audit export | Audit product context and retention contract remain planned. |
| Discovery | Projection contexts plus technical search index | Direct reads must recheck authoritative access and lifecycle | Index and read-model refresh | Freshness is observable; projection data can never authorize. |

Solid dependency labels mean a current decision read is required. Dashed
eventual edges mean a committed, versioned event may update a consumer later.
Neither edge activates a planned context, event, relationship, route, schema,
or acceptance contract.

## Mapping gaps

- Enterprise-team organization assignment exists in the canonical catalog, but
  the Atlas source register does not yet contain sufficient official evidence
  for a confirmed product sequence. It remains a mapping checkpoint in
  [`06-core-sequences.md`](06-core-sequences.md).
- Repository feature enablement, issue schema, entitlements, and audit logs
  have catalog owners but are not all active implementation contracts.
- Organization Discussion behavior after its source repository is archived,
  transferred, deleted, or otherwise unavailable remains unresolved.
- The exact catalog status must always be read from `module-map.json`; this
  dated view is explanatory and becomes stale when the catalog version changes.
