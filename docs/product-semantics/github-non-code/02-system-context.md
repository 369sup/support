# System Context and Containers

This C4-style context view uses a Mermaid flowchart for stable rendering. It
defines product responsibilities, not GitHub's internal deployment topology.

Evidence: GH-AUTH-002, GH-ENTERPRISE-001, GH-ORG-001, GH-TEAM-001,
GH-REPO-001, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001,
GH-NOTIFICATION-001, GH-SEARCH-001, GH-MODERATION-001, and GH-AUDIT-001.

```mermaid
flowchart LR
    classDef actor fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef system fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef external fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef excluded fill:#ffebe9,stroke:#cf222e,color:#24292f,stroke-dasharray:5 5

    subgraph People["People and roles"]
        Visitor["Visitor"]
        Account["Personal account"]
        Member["Organization member"]
        OrgOwner["Organization owner"]
        EnterpriseOwner["Enterprise owner"]
        Moderator["Moderator or maintainer"]
    end

    subgraph Platform["Non-code collaboration platform"]
        Web["Web application"]
        Identity["Identity, account and profile"]
        Governance["Enterprise, organization, team and access"]
        RepoShell["Repository metadata and administration shell"]
        Issues["Issues"]
        Discussions["Discussions"]
        Projects["Projects"]
        Engagement["Notifications, subscriptions, stars and follows"]
        Discovery["Dashboard, activity, search and explore"]
        Safety["Moderation and audit"]
    end

    subgraph External["External boundaries"]
        IdP["Identity provider, SAML and SCIM"]
        Mail["Email delivery"]
        AuditSink["Audit export or stream destination"]
    end

    subgraph Out["Explicitly outside this atlas"]
        Git["Git objects, commits, branches and tags"]
        Code["Code browsing, diffs and review"]
        PR["Pull requests and merge workflows"]
        Actions["Actions and automation execution"]
        DevProducts["Packages, Codespaces, Pages and releases"]
    end

    Visitor --> Web
    Account --> Web
    Member --> Web
    OrgOwner --> Web
    EnterpriseOwner --> Web
    Moderator --> Web

    Web --> Identity
    Web --> Governance
    Web --> RepoShell
    Web --> Issues
    Web --> Discussions
    Web --> Projects
    Web --> Engagement
    Web --> Discovery
    Web --> Safety

    Identity <--> IdP
    Engagement --> Mail
    Safety --> AuditSink

    RepoShell -. "does not own" .-> Git
    Issues -. "no PR linkage modeled" .-> PR
    Web -. "excluded delivery surface" .-> Code
    Web -. "excluded runtime" .-> Actions
    Web -. "deferred products" .-> DevProducts

    class Visitor,Account,Member,OrgOwner,EnterpriseOwner,Moderator actor
    class Web,Identity,Governance,RepoShell,Issues,Discussions,Projects,Engagement,Discovery,Safety system
    class IdP,Mail,AuditSink external
    class Git,Code,PR,Actions,DevProducts excluded
```

## Derived boundary decisions

- A personal account remains distinct from every enterprise, organization,
  team, repository, and project role.
- The repository is retained as a metadata and collaboration owner even though
  its Git objects and code surfaces are excluded.
- Authorization is a cross-cutting decision service; product events remain
  owned by the domain that caused them.
- Search indexes only retained resource types and must enforce the same
  visibility rules as direct navigation.
