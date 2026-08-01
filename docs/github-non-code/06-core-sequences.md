# Core Interaction Sequences

These sequences are target reconstruction flows, not claims about GitHub's
private services. Each diagram isolates one acceptance boundary so account,
membership, repository, collaboration, engagement, discovery, and safety
transactions are not mistaken for one distributed workflow.

Evidence: GH-AUTH-001, GH-AUTH-002, GH-ORG-002, GH-ORG-003, GH-TEAM-001,
GH-REPO-005, GH-REPO-007 through GH-REPO-010, GH-ISSUE-001,
GH-ISSUE-002, GH-COMMUNITY-001, GH-DISCUSSION-001 through
GH-DISCUSSION-003, GH-NOTIFICATION-001, GH-NOTIFICATION-002,
GH-SEARCH-001, GH-MODERATION-003 through GH-MODERATION-005, and
GH-AUDIT-001.

## Account registration and activation

```mermaid
sequenceDiagram
    autonumber
    actor Person
    participant UI as Web UI
    participant Registration as Registration use case
    participant Account as Account owner
    participant Authentication as Authentication provider port
    participant Email as Account email owner
    participant Mail as Email delivery

    Person->>UI: Submit account identity and credentials
    UI->>Registration: Normalize input and check eligibility
    Registration->>Account: Reserve account identity with expected version
    Registration->>Authentication: Create provider-owned credential identity
    alt Provider or account step fails
        Registration-->>UI: Return failure without claiming an active account
    else Registration accepted
        Registration->>Email: Record unverified address and verification intent
        Email->>Mail: Request verification delivery after commit
        Mail-->>Person: Deliver verification link
        Person->>UI: Confirm verification
        UI->>Email: Verify address token and current account state
        Email-->>UI: Return verified account-email state
    end
```

The exact coordinator compensation and provider-recovery behavior are
implementation contracts. The diagram does not turn several owners into one
shared database transaction.

## Organization invitation and acceptance

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Organization owner
    actor Invitee
    participant UI as Web UI
    participant Decision as Invitation decision composition
    participant Membership as Organization membership owner
    participant Publisher as Event publication
    participant Mail as Email delivery consumer

    Owner->>UI: Invite username or email with role and optional team
    UI->>Decision: Check owner role, policy, limits, license and target guards
    alt Invitation denied
        Decision-->>UI: Return normalized unmet prerequisite
    else Invitation permitted
        Decision->>Membership: Create pending invitation with expiry
        Membership-->>UI: Return committed invitation
        Membership-->>Publisher: Publish invitation event after commit
        Publisher-->>Mail: Request invitation delivery
        Mail-->>Invitee: Deliver invitation
        Invitee->>UI: Authenticate and accept
        UI->>Decision: Recheck target, expiry, account, 2FA and policy
        alt Invalid, canceled or expired
            Decision-->>UI: Reject acceptance without membership
        else Valid
            Decision->>Membership: Accept invitation and activate membership
            Membership-->>UI: Return active membership
        end
    end
```

## Enterprise-team organization assignment evidence gate

The canonical Support catalog has an enterprise-team organization-grant owner,
but the current Atlas source register does not yet close this GitHub product
behavior. This sequence deliberately stops before implementation; architecture
metadata is not product evidence.

```mermaid
sequenceDiagram
    autonumber
    actor EnterpriseOwner as Enterprise owner
    participant UI as Web UI
    participant Evidence as Atlas evidence gate
    participant Mapping as Canonical context mapping
    participant Team as Enterprise team owner

    EnterpriseOwner->>UI: Request enterprise-team assignment to organization
    UI->>Evidence: Resolve registered official evidence and atomic requirement
    alt Evidence absent or insufficient
        Evidence-->>UI: Block slice as unresolved
        UI-->>EnterpriseOwner: No command, route, event or persistence activated
    else Future evidence closes behavior
        Evidence->>Mapping: Validate owner, dependencies, lifecycle and authorization
        Mapping->>Team: Permit design of a versioned command contract
        Team-->>UI: Implementation still requires acceptance and activation gates
    end
```

## Repository creation and initial access

```mermaid
sequenceDiagram
    autonumber
    actor Creator
    participant UI as Repository dashboard
    participant Decision as Repository creation decision
    participant Repository as Repository owner
    participant Access as Repository access decision owner
    participant Publisher as Event publication
    participant Projection as Dashboard and search projections

    Creator->>UI: Choose personal or organization owner, name and visibility
    UI->>Decision: Check authenticated actor, owner permission, policy and availability
    alt Creation denied or name unavailable
        Decision-->>UI: Return denial or validation conflict
    else Creation permitted
        Decision->>Repository: Create repository shell
        Repository-->>UI: Return committed repository identity
        UI->>Access: Resolve owner-derived initial access from authoritative facts
        Access-->>UI: Return effective permission
        Repository-->>Publisher: Publish RepositoryCreated event after contract activation
        Publisher-->>Projection: Refresh visible repository lists eventually
    end
```

## Repository lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Repository admin or owner
    participant UI as Repository settings
    participant Decision as Lifecycle decision composition
    participant Repository as Repository lifecycle owner
    participant Publisher as Event publication
    participant Consumers as Access, search, activity and audit consumers

    Admin->>UI: Archive, unarchive, delete or restore repository
    UI->>Decision: Check current version, lifecycle, authority, policy and confirmation
    alt Denied, stale or invalid transition
        Decision-->>UI: Return normalized denial or conflict
    else Allowed transition
        Decision->>Repository: Commit one lifecycle transition and outbox envelope
        Repository-->>UI: Return authoritative new state
        Repository-->>Publisher: Publish versioned lifecycle event after commit
        Publisher-->>Consumers: Reconcile idempotently and eventually
        Note over Repository,Consumers: Direct reads and commands honor the new state before projections catch up
    end
```

## Issue and conversation mutation

```mermaid
sequenceDiagram
    autonumber
    actor Contributor
    actor Maintainer
    participant UI as Issue UI
    participant Decision as Issue use-case decision
    participant Issue as Issue owner
    participant Conversation as Conversation owner
    participant Publisher as Event publication

    Contributor->>UI: Create issue with allowed metadata
    UI->>Decision: Check repository visibility, issue availability and create permission
    alt Not permitted
        Decision-->>UI: Deny without mutation
    else Permitted
        Decision->>Issue: Create open issue
        Issue-->>UI: Return committed issue
        Issue-->>Publisher: Publish IssueCreated after contract activation
    end
    Contributor->>UI: Add comment or edit permitted metadata
    UI->>Decision: Recheck author, role, lock, block and interaction limit
    alt Object or safety guard denies
        Decision-->>UI: Deny without conversation event
    else Permitted
        Decision->>Conversation: Commit comment or metadata mutation
        Conversation-->>Publisher: Publish versioned conversation event after commit
    end
    Maintainer->>UI: Close as completed or not planned
    UI->>Decision: Check author or triage-plus rule and current version
    Decision->>Issue: Commit allowed close reason
```

## Discussion moderation

```mermaid
sequenceDiagram
    autonumber
    actor Moderator
    participant UI as Discussion UI
    participant Decision as Discussion moderation decision
    participant Discussion as Discussion owner
    participant Conversation as Conversation owner
    participant Safety as Moderation owner
    participant Publisher as Event publication

    Moderator->>UI: Lock, answer, pin, close, transfer, convert or moderate content
    UI->>Decision: Resolve source repository, role, category format, object state and safety guard
    alt Source authority unavailable or action invalid
        Decision-->>UI: Deny without partial cross-context changes
    else Discussion lifecycle action
        Decision->>Discussion: Commit one discussion-owned transition
        Discussion-->>Publisher: Publish discussion event after commit
    else Conversation lock or reply action
        Decision->>Conversation: Commit one conversation-owned transition
        Conversation-->>Publisher: Publish conversation event after commit
    else Report or visibility moderation action
        Decision->>Safety: Commit one moderation-owned transition
        Safety-->>Publisher: Publish moderation event after commit
    end
```

Conversion between a Discussion and an Issue needs an explicit orchestration
and compensation contract because the two product facts have different owners;
this diagram does not imply a distributed transaction.

## Notification generation and inbox triage

```mermaid
sequenceDiagram
    autonumber
    actor Recipient
    participant Publisher as Event publication
    participant Notification as Notification owner
    participant Access as Authoritative read decision
    participant Inbox as Inbox UI
    participant Channel as External delivery adapter

    Publisher-->>Notification: Deliver compatible subject event
    Notification->>Access: Recheck recipient interest and subject visibility
    alt Recipient not interested or cannot read subject
        Access-->>Notification: Suppress notification creation
    else Eligible recipient
        Notification->>Notification: Idempotently create notification and reason
        Notification-->>Channel: Request configured delivery after commit
        Notification-->>Inbox: Expose inbox item
    end
    Recipient->>Inbox: Mark read, unread, saved, done or unsubscribe
    Inbox->>Notification: Commit one triage or subscription-owned command
    Notification-->>Inbox: Return independent read and triage state
```

## Search indexing and permission-safe lookup

```mermaid
sequenceDiagram
    autonumber
    actor Searcher
    participant Publisher as Event publication
    participant Projector as Search projector
    participant Index as Non-code search index
    participant Search as Search query use case
    participant Access as Authoritative access and lifecycle decisions

    Publisher-->>Projector: Deliver compatible resource event
    Projector->>Projector: Claim event ID and apply ordering rule
    Projector->>Index: Upsert or tombstone searchable document
    Searcher->>Search: Submit global or scoped query
    Search->>Index: Retrieve candidate retained resources
    Index-->>Search: Return possibly stale candidates
    Search->>Access: Filter candidates using current visibility and lifecycle facts
    Access-->>Search: Return permitted results only
    Search-->>Searcher: Show results without disclosing hidden candidates
```

## Blocking and interaction limits

Blocking and interaction limits cross domain boundaries. The safety source of
truth must deny new interactions immediately; relationship cleanup can follow
the committed event without reopening an authorization window.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Account or organization owner
    actor Moderator as Organization moderator or repository admin
    actor Target as Restricted account
    participant UI as Web UI
    participant Decision as Use-case authorization composition
    participant Safety as Safety controls
    participant Publisher as Event publication
    participant Domains as Collaboration and engagement consumers
    participant Expiry as Scheduled command runner

    Owner->>UI: Block target with scope and optional organization duration
    UI->>Decision: Validate actor, scope and organization non-member guard
    alt Block not permitted
        Decision-->>UI: Deny without changing relationships
    else Block permitted
        Decision->>Safety: Commit block relationship
        Safety-->>Publisher: Publish relationship-removal event after commit
        Publisher-->>Domains: Reconcile follows, stars, assignments, subscriptions, invitations and grants
        Safety-->>UI: Return authoritative active block
    end
    Target->>UI: Attempt blocked interaction
    UI->>Decision: Read current block and other decision facts
    Decision-->>UI: Deny from safety source of truth

    Moderator->>UI: Select interaction-limit scope, cohort and duration
    UI->>Decision: Check role, repository visibility and higher-scope precedence
    alt Limit permitted
        Decision->>Safety: Commit active limit with expiry
        Expiry->>Safety: Later issue idempotent expiry command
    else Limit denied
        Decision-->>UI: Return scope, actor or precedence failure
    end
```

## Required failure coverage

- duplicate, expired, canceled, flagged-account, unverified-email, required-2FA,
  plan-license, and rate-limit invitation cases;
- provider failure and partial account-registration coordination without an
  incorrectly reported active account;
- repository name conflict, owner ineligibility, policy denial, stale version,
  archive/read-only guard, delete confirmation, restore ineligibility, and
  projection lag;
- policy-denied, role-denied, archived-repository, locked-conversation, block,
  and interaction-limit issue mutations;
- invalid Discussion source authority, category format, answer eligibility,
  lock/delete/transfer/convert failure, and cross-owner compensation;
- notification participation, mention, watch, custom watch, ignore,
  unsubscribe, done, saved, retention, duplicate event, and hidden-subject
  cases;
- stale search documents, deleted tombstones, hidden candidates, duplicate or
  out-of-order events, replay, and projector rebuild;
- invalid block scope, organization-member target, unauthorized moderator,
  finite/indefinite unblock, higher-scope interaction-limit precedence, cohort
  mismatch, expiry, and idempotent relationship-cascade cases;
- audit/timeline side effects only after the associated command outcome is
  committed and known.
