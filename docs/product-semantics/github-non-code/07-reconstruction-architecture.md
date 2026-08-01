# Reconstruction Architecture

This is a target architecture inferred for faithful, low-ambiguity
implementation. It is not evidence of GitHub's internal topology. A modular
monolith keeps semantic transactions and authorization decisions inspectable;
asynchronous projections isolate delivery, search, and audit export.

Evidence for product boundaries: GH-AUTH-002, GH-ENTERPRISE-002, GH-ORG-001,
GH-REPO-001, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001,
GH-NOTIFICATION-001, GH-SEARCH-001, and GH-AUDIT-001.

```mermaid
flowchart TB
    classDef boundary fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef app fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef domain fill:#dafbe1,stroke:#1a7f37,color:#24292f
    classDef data fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef external fill:#fbefff,stroke:#8250df,color:#24292f

    Browser["Browser and accessible web UI"] --> Delivery["Web delivery and route adapters"]
    Delivery --> Application["Application commands and queries"]
    Application --> Policy["Central authorization and policy evaluation"]

    subgraph Modules["Modular-monolith semantic modules"]
        Identity["Identity and profile"]
        Governance["Enterprise, organization and teams"]
        Repository["Repository administration shell"]
        Issues["Issues"]
        Discussions["Discussions"]
        Projects["Projects"]
        Engagement["Subscriptions, notifications and social graph"]
        Discovery["Dashboard, non-code search and explore"]
        Safety["Moderation and audit"]
    end

    Policy --> Identity
    Policy --> Governance
    Policy --> Repository
    Policy --> Issues
    Policy --> Discussions
    Policy --> Projects
    Policy --> Engagement
    Policy --> Discovery
    Policy --> Safety

    Identity --> Store[("Transactional relational store")]
    Governance --> Store
    Repository --> Store
    Issues --> Store
    Discussions --> Store
    Projects --> Store
    Engagement --> Store
    Safety --> Store

    Modules --> Outbox[("Transactional outbox")]
    Outbox --> NotificationWorker["Notification delivery worker"]
    Outbox --> SearchProjector["Non-code search projector"]
    Outbox --> AuditProjector["Audit export projector"]

    NotificationWorker --> Mail["Email provider"]
    SearchProjector --> SearchIndex[("Search index")]
    AuditProjector --> AuditSink["Audit export or stream destination"]
    Identity <--> IdP["SAML, SCIM or social identity provider"]
    Discovery --> SearchIndex

    Excluded["No Git object store, code index, PR engine, Actions runner, package registry or Codespaces control plane"]:::boundary

    class Browser,Excluded boundary
    class Delivery,Application,Policy,NotificationWorker,SearchProjector,AuditProjector app
    class Identity,Governance,Repository,Issues,Discussions,Projects,Engagement,Discovery,Safety domain
    class Store,Outbox,SearchIndex data
    class Mail,AuditSink,IdP external
```

## Architecture decisions requiring implementation contracts

- Commands own transactions; search, notification delivery, and external audit
  export consume committed events.
- The transactional outbox is a reconstruction reliability choice, not a
  GitHub-documented fact.
- Authorization must be callable consistently from routes, commands, search,
  notification projection, and navigation visibility.
- The search index contains only retained non-code resources and never becomes
  the authority for access or lifecycle state.
- Audit facts are append-only observations; moderation state and operational
  delivery state remain owned by their product modules.
- External identity and email providers are ports. No provider-specific rule is
  part of the domain unless official product semantics require it.
