# Documentation Architecture

This document describes the control structure for documentation under `docs/`
and preserves the integrated GitHub non-code product-semantic architecture
views. The product views are evidence-backed reconstruction input: they do not
claim GitHub's internal topology, replace Support's canonical technical
architecture, activate a bounded context, or assign literal routes. Those
concerns remain with the sources listed in
[`SOURCE-OF-TRUTH.md`](SOURCE-OF-TRUTH.md).

## Layers

The documentation system has four layers:

1. **Repository authorities** own product, technical, route, and change
   contracts outside this governance set.
2. **Governance contracts** define documentation authority, classification,
   metadata, naming, relationships, and accepted documentation decisions.
3. **Operating documents** define creation, maintenance, migration, validation,
   history, and planned improvements.
4. **Navigation and reference documents** help readers find and apply the
   contracts without becoming new sources of truth.

```mermaid
flowchart TD
  authorities["Repository authorities"] --> source["SOURCE-OF-TRUTH.md"]
  source --> contracts["Governance contracts"]
  contracts --> operations["Operating documents"]
  contracts --> navigation["Navigation and references"]
  operations --> records["Change and decision records"]
  navigation --> authorities
  records --> source
```

Arrows represent a required input or a navigation path. They do not transfer
semantic ownership. The authoritative relationship vocabulary is defined in
[`DEPENDENCIES.md`](DEPENDENCIES.md), and the concrete inventory lives in
[`DOCUMENT-MAP.md`](DOCUMENT-MAP.md).

## Invariants

- Every normative concern has one clearly named owner.
- A supporting document links to an authority instead of restating its rules.
- Current state, accepted decisions, history, and future intent remain separate.
- Generated documents identify their input and are not edited directly.
- A document records its audience, owner, update trigger, relationships, and
  validation path in the document map.
- Existing documentation subtrees keep their current filenames and local
  guidance unless their owning contract is intentionally changed.
- Documentation never claims implementation, verification, source freshness,
  or operational readiness without current evidence.

## Navigation model

[`README.md`](README.md) is the task-oriented entrypoint. [`INDEX.md`](INDEX.md)
is a browsable catalog. Neither owns normative content. Readers use them to
reach the document registered in `DOCUMENT-MAP.md`, then follow that document's
authority and dependency links.

## Change propagation

A change begins at the canonical owner. The maintainer then updates directly
dependent operating documents, navigation entries, examples, and records only
when their content is affected. Broad synchronization is not required merely
because documents link to one another; impact follows the relationship types in
`DEPENDENCIES.md`.

## GitHub non-code system context

This C4-style context view defines product responsibilities, not GitHub's
internal deployment topology.

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

    subgraph Out["Explicitly outside the integrated model"]
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

### Derived system-boundary decisions

- A personal account remains distinct from every enterprise, organization,
  team, repository, and project role.
- The repository is retained as a metadata and collaboration owner even though
  its Git objects and code surfaces are excluded.
- Authorization is a cross-cutting decision service; product events remain
  owned by the domain that caused them.
- Search indexes only retained resource types and must enforce the same
  visibility rules as direct navigation.

## Authorization decision model

This is a derived authorization model. GitHub Docs confirms the role, policy,
grant, and object-level facts, but does not publish one universal evaluation
algorithm. The ordering below is the smallest deterministic target model that
preserves confirmed restrictions.

Evidence: GH-ENTERPRISE-001, GH-ENTERPRISE-002, GH-ORG-001, GH-TEAM-001,
GH-REPO-002, GH-REPO-003, GH-REPO-005, GH-REPO-007, GH-ISSUE-002,
GH-COMMUNITY-001, GH-DISCUSSION-001, GH-DISCUSSION-003, GH-PROJECT-002,
GH-MODERATION-002, and GH-AUDIT-001.

```mermaid
flowchart TD
    Request["Action request"] --> Identity{"Authenticated when action requires it?"}
    Identity -- "No" --> StopUnauth["Stop: authentication required"]
    Identity -- "Yes or public read" --> Scope["Resolve account, enterprise, organization, repository and object scope"]
    Scope --> Visibility{"Resource visible to this principal?"}
    Visibility -- "No" --> StopHidden["Stop: resource unavailable"]
    Visibility -- "Yes" --> Policies["Apply enterprise and organization policies"]
    Policies --> Restriction{"A policy restricts the action?"}
    Restriction -- "Yes and no documented bypass" --> StopPolicy["Stop: policy restriction"]
    Restriction -- "No or bypass allowed" --> Grants["Collect applicable grants"]

    subgraph Sources["Grant sources"]
        Owner["Personal owner or enterprise or organization owner"]
        OrgRole["Organization predefined or custom role"]
        Base["Organization base repository permission"]
        Team["Team grant plus inherited parent-team access"]
        Direct["Direct user or outside-collaborator grant"]
        RepoRole["Repository role: read, triage, write, maintain, admin"]
        ObjectRole["Object rule: author, assignee, project collaborator or moderator"]
    end

    Owner --> Grants
    OrgRole --> Grants
    Base --> Grants
    Team --> Grants
    Direct --> Grants
    RepoRole --> Grants
    ObjectRole --> Grants

    Grants --> Effective["Derive effective permissions from all grants"]
    Effective --> Required{"Required permission is present?"}
    Required -- "No" --> StopDenied["Stop: action denied"]
    Required -- "Yes" --> StateGuard{"Resource state permits mutation?"}
    StateGuard -- "No: archived, deleted, closed constraint, or locked constraint" --> StopState["Stop: state guard"]
    StateGuard -- "Yes" --> Confirmation{"Destructive action needs explicit confirmation?"}
    Confirmation -- "Yes and missing" --> StopConfirm["Stop: confirmation required"]
    Confirmation -- "No or confirmed" --> Allow["Allow command"]
    Allow --> Audit["Record applicable audit or timeline event"]

    classDef stop fill:#ffebe9,stroke:#cf222e,color:#24292f
    classDef allow fill:#dafbe1,stroke:#1a7f37,color:#24292f
    class StopUnauth,StopHidden,StopPolicy,StopDenied,StopState,StopConfirm stop
    class Allow allow
```

### Minimum permission matrix

| Action | Confirmed qualifying actor or grant | Additional guard |
| --- | --- | --- |
| Invite organization member | Organization owner | Invitation limit, license when applicable, target account/email, expiry, required 2FA. |
| Add/remove team member | Organization owner or team maintainer | Principal must be an organization member. |
| Manage repository access | Repository admin; organization owner has administrative access | Enterprise/organization policy can restrict access management. |
| Close own issue | Issue author | Issue and repository must allow the action. |
| Close another user's issue | Personal-repository owner/collaborator or organization-repository triage-plus | Preserve completed/not-planned reason. |
| Manage discussion category | Write-plus for repository or source repository | Discussion feature and valid format/category constraints. |
| Moderate discussion | Triage-plus for repository or organization discussion source repository | Lock, answer, convert, and comment rules differ. |
| Change project visibility | Project admin or applicable organization owner | Item visibility remains constrained by its repository. |
| Archive, transfer, or delete repository | Repository admin or applicable owner | Policy, target eligibility, typed confirmation, and lifecycle guard. |
| Review organization audit log | Organization owner | Retention, query, export, and actor-visibility rules. |

No HTTP status, existence-disclosure rule, or deny precedence beyond documented
policy restrictions is asserted here. Those remain unresolved API-contract
decisions.

## Reconstruction architecture

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

### Decisions requiring implementation contracts

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

## Logical product navigation

This diagram defines reachable destinations and navigation responsibilities.
Labels are logical screens, not literal GitHub or Support URLs. The route
contract must assign concrete paths without changing these product semantics.

Evidence: GH-DASH-001, GH-PROFILE-001, GH-ORG-001, GH-TEAM-001,
GH-REPO-003, GH-ISSUE-001, GH-DISCUSSION-001, GH-PROJECT-001,
GH-PROJECT-002, GH-NOTIFICATION-002, and GH-SEARCH-001.

```mermaid
flowchart LR
    Start["Entry"] --> Session{"Signed in?"}

    Session -- "No" --> PublicHome["Public home and explore"]
    PublicHome --> GlobalSearch["Global non-code search"]
    PublicHome --> PublicProfile["Public profile"]
    PublicHome --> PublicOrg["Public organization"]
    PublicHome --> PublicRepo["Visible repository shell"]
    PublicRepo --> PublicIssues["Issues"]
    PublicRepo --> PublicDiscussions["Discussions"]
    PublicRepo --> PublicProjects["Linked visible projects"]
    PublicHome --> SignIn["Sign up or sign in"]

    Session -- "Yes" --> Dashboard["Personal dashboard"]
    SignIn --> Dashboard
    Dashboard --> Notifications["Notifications inbox"]
    Dashboard --> IssueDashboard["Cross-repository issue dashboard"]
    Dashboard --> Search["Global search and recent destinations"]
    Dashboard --> Profile["Own profile and contribution settings"]
    Dashboard --> Settings["Account, profile and notification settings"]
    Dashboard --> Organizations["Organizations"]
    Dashboard --> Repositories["Recent and accessible repositories"]
    Dashboard --> Projects["User and organization projects"]

    Organizations --> OrgOverview["Organization overview"]
    OrgOverview --> OrgPeople["People, invitations and roles"]
    OrgOverview --> OrgTeams["Teams and nested teams"]
    OrgOverview --> OrgRepos["Organization repositories"]
    OrgOverview --> OrgProjects["Organization projects"]
    OrgOverview --> OrgDiscussions["Organization discussions"]
    OrgOverview --> OrgSettings["Policies, moderation and audit"]

    OrgTeams --> TeamPage["Team members, child teams, repositories and projects"]
    OrgRepos --> RepoOverview["Repository overview shell"]
    Repositories --> RepoOverview
    RepoOverview --> IssuesList["Issues list, filters and saved views"]
    IssuesList --> IssueDetail["Issue detail, metadata, relations and timeline"]
    RepoOverview --> DiscussionsList["Discussion categories and list"]
    DiscussionsList --> DiscussionDetail["Discussion, replies, answer and moderation"]
    RepoOverview --> RepoProjects["Repository-linked projects"]
    RepoOverview --> RepoSettings["Visibility, access, archive, transfer and delete"]

    Projects --> ProjectView["Table, board or roadmap view"]
    OrgProjects --> ProjectView
    RepoProjects --> ProjectView
    ProjectView --> ProjectSettings["Fields, views, access, visibility, close and delete"]

    Notifications --> NotificationSubject["Issue, discussion, repository or organization subject"]
    Search --> PublicProfile
    Search --> OrgOverview
    Search --> RepoOverview
    Search --> IssueDetail
    Search --> DiscussionDetail
    Search --> ProjectView

    Note["Logical destinations only; exact application URLs are a separate route contract"]
```

### Navigation invariants

- Public navigation exposes only resources visible to the visitor.
- Authentication returns the user to a valid destination or the personal
  dashboard; it never creates product authorization by itself.
- Menus and direct navigation use the same authorization decision.
- Search results and notification deep links re-evaluate current visibility and
  state.
- Project visibility does not reveal inaccessible private-repository items.
- Administrative destinations appear only for actors with the corresponding
  scoped permission.
