# Database Design Diagrams

Every node below maps to `active-model.md`, `planned-model.md`, or an exact SQL
object. Diagrams summarize those contracts and do not add semantics.

## Logical bounded-context model

```mermaid
flowchart LR
    Evidence["GitHub source IDs and requirements"] --> Atlas["github-non-code logical model"]
    Atlas --> Identity["Identity contexts"]
    Atlas --> Governance["Enterprise and organization contexts"]
    Atlas --> Repository["Repository and access contexts"]
    Atlas --> Collaboration["Collaboration contexts"]
    Atlas --> Engagement["Engagement contexts"]
    Identity --> Platform["Outbox, audit, scheduling, media, search"]
    Governance --> Repository
    Repository --> Collaboration
    Collaboration --> Engagement
    Platform --> Projections["Rebuildable projections"]
```

## Active physical ownership

```mermaid
flowchart TB
    Runtime["support_web_runtime"] --> Identity["support_identity_* schemas"]
    Runtime --> Governance["support_enterprises_* and support_organizations_* schemas"]
    Runtime --> Repository["support_repositories_* schemas"]
    Runtime --> Collaboration["support_collaboration_* schemas"]
    Runtime --> Engagement["support_engagement_* schemas"]
    Runtime --> Platform["support_platform_* schemas"]
    Runtime --> Projections["support_projections_* schemas"]
    Auth["Supabase auth.users"] --> Private["support_private provisioning functions"]
    Private --> Account["account + identity + primary email + profile in one transaction"]
    Account --> Identity
    Storage["Private support-media bucket"] --> Platform
    Browser["anon / authenticated / service_role"] -. "no product grants" .-> Runtime
```

## Lifecycle encoding

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> Archived: archive command
    Archived --> Active: restore command
    Active --> Deleted: authorized deletion
    Archived --> Deleted: authorized deletion
    Deleted --> Restored: restoration window and policy allow
    Deleted --> Erased: retention expires
    Restored --> Active
    Erased --> [*]
```

Independent state dimensions such as visibility, membership, invitation,
conversation lock, issue/discussion closure, delivery, and publication use
their own named text `CHECK` constraints; they are not collapsed into this
illustrative lifecycle.

## Authorization decision flow

```mermaid
flowchart TD
    Actor["Verified account subject"] --> Membership["Enterprise and organization memberships"]
    Membership --> Roles["Role assignments"]
    Roles --> Policies["Enterprise and organization policies"]
    Policies --> Grants["Repository account and team grants"]
    Grants --> ObjectRules["Resource visibility and lifecycle guards"]
    ObjectRules --> Decision{"Command permitted?"}
    Decision -->|yes| Transaction["Domain mutation + audit + outbox transaction"]
    Decision -->|no| Denied["Generic forbidden result; no mutation"]
```

## Cross-context effects

```mermaid
flowchart LR
    Command["Bounded-context command"] --> Mutation["Owning schema mutation"]
    Mutation --> Audit["support_platform_audit_storage"]
    Mutation --> Outbox["support_platform_event_publication"]
    Outbox --> Dispatcher["Server-only dispatcher"]
    Dispatcher --> Notification["support_engagement_notifications"]
    Dispatcher --> Search["support_platform_search_index"]
    Dispatcher --> Projection["support_projections_*"]
    Projection -. "never authorizes" .-> Command
```

## Generation and release

```mermaid
flowchart TD
    Design["Resolve atlas-to-physical design"] --> Schema["Edit ordered supabase/schemas SQL"]
    Schema --> Render["Render affected Mermaid diagrams"]
    Render --> Diff["supabase db diff -f change"]
    Diff --> Review{"DROP, data loss, or privilege expansion?"}
    Review -->|unexplained| Stop["Reject migration and return to design"]
    Review -->|reviewed| Reset["supabase db reset from empty local database"]
    Reset --> EmptyDiff{"Follow-up diff empty?"}
    EmptyDiff -->|no| Schema
    EmptyDiff -->|yes| DeployMigration["Deploy immutable migration"]
    DeployMigration --> Contract["Verify support_private.schema_contract"]
    Contract --> App["Deploy application"]
    App --> Smoke["Auth, routes, RLS, grants, advisors, Playwright"]
    Smoke -->|failure| ForwardFix["Restore app or ship reviewed forward fix"]
```
