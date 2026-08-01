# Reconstruction Architecture

This is a target architecture inferred for faithful, low-ambiguity
implementation. It is not evidence of GitHub's internal topology. A modular
monolith keeps context-local mutations and use-case decisions inspectable;
asynchronous publication and rebuildable projections isolate delivery, search,
notifications, and audit export.

Evidence for product boundaries: GH-AUTH-002, GH-ENTERPRISE-002, GH-ORG-001,
GH-REPO-001, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001,
GH-PROJECT-005, GH-NOTIFICATION-001, GH-SEARCH-001,
GH-MODERATION-003 through GH-MODERATION-005, and GH-AUDIT-001.

```mermaid
flowchart TB
    classDef boundary fill:#fff4d6,stroke:#9a6700,color:#24292f
    classDef app fill:#ddf4ff,stroke:#0969da,color:#24292f
    classDef domain fill:#dafbe1,stroke:#1a7f37,color:#24292f
    classDef data fill:#f6f8fa,stroke:#57606a,color:#24292f
    classDef external fill:#fbefff,stroke:#8250df,color:#24292f

    Browser["Browser and accessible web UI"] --> Delivery["Web delivery and route adapters"]
    Delivery --> UseCase["Use-case-owned command or query composition"]

    subgraph Decisions["Resource-owned synchronous decision ports"]
        IdentityDecision["Identity and authentication facts"]
        MembershipDecision["Membership, role and team facts"]
        RepositoryDecision["Repository visibility, lifecycle and effective access"]
        PolicyDecision["Enterprise and organization restrictions"]
        EntitlementDecision["Feature and plan availability"]
        SafetyDecision["Blocks, interaction limits and moderation guards"]
        ObjectDecision["Issue, discussion, project and conversation rules"]
    end

    UseCase --> IdentityDecision
    UseCase --> MembershipDecision
    UseCase --> RepositoryDecision
    UseCase --> PolicyDecision
    UseCase --> EntitlementDecision
    UseCase --> SafetyDecision
    UseCase --> ObjectDecision

    UseCase --> FinalDecision{"Final normalized decision allows command?"}
    FinalDecision -- "No" --> Denial["Delivery-safe denial or unavailable result"]
    FinalDecision -- "Yes" --> OwnerCommand["Invoke exactly one context-owning command"]
    OwnerCommand --> SelectedOwner["Selected semantic owner"]

    subgraph Owners["Semantic owners in the modular monolith"]
        Identity["Identity and profile"]
        Governance["Enterprise, organization and teams"]
        Repository["Repository administration shell"]
        Collaboration["Issues, conversations, Discussions and Projects"]
        Engagement["Subscriptions, notifications and social graph"]
        Safety["Relationship safety and moderation"]
    end

    SelectedOwner -. "one of" .-> Identity
    SelectedOwner -. "one of" .-> Governance
    SelectedOwner -. "one of" .-> Repository
    SelectedOwner -. "one of" .-> Collaboration
    SelectedOwner -. "one of" .-> Engagement
    SelectedOwner -. "one of" .-> Safety
    SelectedOwner --> Transaction[("Context-local transaction: state plus outbox envelope")]
    Transaction --> Publisher["Event publication: lease, retry, redelivery and dead letter"]

    Publisher --> NotificationProjector["Notification consumer"]
    Publisher --> SearchProjector["Search and discovery projector"]
    Publisher --> AuditProjector["Audit consumer"]

    NotificationProjector --> NotificationStore[("Notification context state")]
    NotificationStore --> Channel["Notification-channel adapter"]
    Channel --> Mail["Email or push provider"]
    SearchProjector --> SearchIndex[("Rebuildable non-code search index")]
    AuditProjector --> AuditStore[("Audit storage and retention adapter")]
    AuditStore --> AuditSink["Audit export or stream destination"]
    IdentityDecision <--> IdP["Enterprise SSO or social identity provider"]

    Query["Permission-filtered query use case"] --> RepositoryDecision
    Query --> SearchIndex
    Delivery --> Query

    Excluded["No Git object store, code index, PR engine, Actions runner, package registry or Codespaces control plane"]:::boundary

    class Browser,Excluded boundary
    class Delivery,UseCase,FinalDecision,OwnerCommand,SelectedOwner,Denial,Publisher,NotificationProjector,SearchProjector,AuditProjector,Query app
    class IdentityDecision,MembershipDecision,RepositoryDecision,PolicyDecision,EntitlementDecision,SafetyDecision,ObjectDecision,Identity,Governance,Repository,Collaboration,Engagement,Safety domain
    class Transaction,NotificationStore,SearchIndex,AuditStore data
    class Mail,AuditSink,IdP external
```

| Semantic owner | Owns | Must not own |
| --- | --- | --- |
| Identity and profile | Personal account, authentication boundary, email and profile facts | Organization/repository/project roles |
| Governance | Enterprise/organization membership, invitations, teams, scoped roles and policy | Repository or collaboration object state |
| Repository | Owner shell, visibility, access grants, rename and lifecycle | Git objects or code surfaces |
| Issues and conversations | Issue lifecycle, relations, assignment, comments, reactions and locks | Project-specific field definitions or values |
| Discussions | Categories, discussions, answers, pins and discussion lifecycle | Organization membership or source-repository access |
| Projects | Project grants, items, fields, views, workflows and project/item lifecycle | Visibility of referenced repository content |
| Engagement | Subscriptions, notifications, stars and follows | Authoritative subject visibility |
| Projections | Dashboard, activity, discovery and search read models | Authorization or lifecycle authority |
| Safety and audit | Blocks, interaction limits, reports, moderation facts and retained audit observations | Source-domain content or delivery telemetry |

Authorization composes current facts from these owners. No context may copy a
role, block, visibility, entitlement, or lifecycle value and then treat the
copy as an independent authority. The exact catalog mapping is validated in
[`09-capability-context-map.md`](09-capability-context-map.md).

## Architecture decisions requiring implementation contracts

- One command commits one context-local version-checked transition and its
  event envelope in the same context-owned outbox. Cross-context distributed
  transactions are not the default.
- Publication failure after commit does not roll back the command. Consumers
  must tolerate delay and duplicate redelivery and must persist an idempotency
  receipt with their local side effect.
- Use cases own authorization composition. Resource contexts expose decision
  ports; there is no central authorization service that owns or copies all
  product facts.
- Blocks and interaction limits are synchronous authorization inputs. Their
  cross-domain cleanup is event-driven, but projection lag must never permit an
  interaction that the committed safety source of truth denies.
- Project permission and project visibility do not replace repository
  visibility for referenced items; both decisions must pass.
- Search, dashboard, activity, and discovery projections are rebuildable and
  eventually consistent. A projection never becomes the authority for access
  or lifecycle state.
- Audit facts are append-only observations; moderation state and operational
  delivery state remain owned by their product contexts.
- External identity, delivery, index, and audit providers are ports. No
  provider-specific rule enters the domain without a verified product need.
