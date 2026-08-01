# System Context and Capability Landscape

The first view is a C4-style system context: it shows people, the modeled
product boundary, external systems, and explicit exclusions. It does not mix
internal capability ownership into the context boundary or claim GitHub's
private deployment topology.

Evidence: GH-AUTH-002, GH-ENTERPRISE-001, GH-ORG-001, GH-TEAM-001,
GH-REPO-001, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001,
GH-PROJECT-005, GH-NOTIFICATION-001, GH-SEARCH-001, GH-MODERATION-001,
GH-MODERATION-003 through GH-MODERATION-005, and GH-AUDIT-001.

```mermaid
flowchart LR
    classDef actor fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef system fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef external fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef excluded fill:#ffebe9,stroke:#cf222e,color:#24292f,stroke-dasharray:5 5

    Visitor["Visitor"]:::actor
    Account["Personal account"]:::actor
    Member["Organization member"]:::actor
    OrgOwner["Organization owner"]:::actor
    EnterpriseOwner["Enterprise owner"]:::actor
    Moderator["Moderator or maintainer"]:::actor

    Platform["GitHub-like non-code collaboration platform"]:::system

    IdP["Identity provider and enterprise SSO"]:::external
    Mail["Email delivery"]:::external
    AuditSink["Audit export or stream destination"]:::external

    Excluded["Git objects and code; commits, branches and tags; diffs and pull requests; review and merge; Actions; packages, Codespaces, Pages and releases"]:::excluded

    Visitor --> Platform
    Account --> Platform
    Member --> Platform
    OrgOwner --> Platform
    EnterpriseOwner --> Platform
    Moderator --> Platform

    Platform <--> IdP
    Platform --> Mail
    Platform --> AuditSink
    Platform -. "explicitly excluded" .-> Excluded
```

The second view is the internal product capability landscape. The boxes are
semantic responsibilities, not deployable services or the canonical Support
bounded-context catalog. Exact context ownership and status are mapped in
[`09-capability-context-map.md`](09-capability-context-map.md).

```mermaid
flowchart TB
    Identity["Identity, account and profile"]
    Governance["Enterprise, organization, membership, team, roles and policy"]
    Repository["Repository metadata, visibility, access and lifecycle shell"]
    Collaboration["Issues, conversations, Discussions and Projects"]
    Engagement["Subscriptions, notifications, stars and follows"]
    Discovery["Dashboard, activity, search and explore"]
    Safety["Blocks, interaction limits, moderation and audit"]

    Identity --> Governance
    Governance --> Repository
    Repository --> Collaboration
    Collaboration --> Engagement
    Identity --> Engagement

    Identity -. "visible account facts" .-> Discovery
    Repository -. "visible repository facts" .-> Discovery
    Collaboration -. "visible work facts" .-> Discovery
    Engagement -. "interest and activity" .-> Discovery

    Safety -. "synchronous guard" .-> Governance
    Safety -. "synchronous guard" .-> Repository
    Safety -. "synchronous guard" .-> Collaboration
    Governance -. "decision facts" .-> Repository
    Repository -. "decision facts" .-> Collaboration

    classDef core fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef derived fill:#f6f8fa,stroke:#57606a,color:#24292f,stroke-dasharray:5 5
    classDef guard fill:#ffebe9,stroke:#cf222e,color:#24292f
    class Identity,Governance,Repository,Collaboration,Engagement core
    class Discovery derived
    class Safety guard
```

## Derived boundary decisions

- A personal account remains distinct from every enterprise, organization,
  team, repository, and project role.
- The repository is retained as a metadata and collaboration owner even though
  its Git objects and code surfaces are excluded.
- Authorization is composed by each use case from resource-owned decision
  facts and ports. It is not a central business owner, and product events remain
  owned by the context that commits the fact.
- Personal/organization blocks and repository interaction limits are
  cross-capability safety guards. They are neither identity roles nor ordinary
  repository grants.
- Search indexes only retained resource types, rechecks authoritative
  visibility on reads, and never becomes an authorization source.
- Web is the modeled delivery surface. GitHub CLI, Mobile, GraphQL, and REST
  observations may support a source claim, but their transport contracts are
  deferred and must not be inferred from either diagram.
