# Core Interaction Sequences

These sequences are target reconstruction flows, not claims about GitHub's
private services. They preserve observable actors, prerequisites, results, and
side effects from the official documentation.

Evidence: GH-ORG-002, GH-ORG-003, GH-ISSUE-001, GH-ISSUE-002,
GH-COMMUNITY-001, GH-NOTIFICATION-001, GH-NOTIFICATION-002, and GH-AUDIT-001.

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Organization owner
    actor Invitee as Invitee
    actor Contributor as Contributor
    participant UI as Web UI
    participant AuthZ as Authorization and policy
    participant Membership as Membership service
    participant Work as Issue service
    participant Notify as Subscription and notification
    participant Audit as Audit timeline
    participant Mail as Email delivery

    rect rgb(221, 244, 255)
        Note over Owner,Mail: Organization invitation and acceptance
        Owner->>UI: Invite by username or email with role and optional team
        UI->>AuthZ: Check owner role, policy, license and invitation limits
        alt Invitation not permitted
            AuthZ-->>UI: Explain the unmet prerequisite
        else Invitation permitted
            UI->>Membership: Create pending invitation with seven-day expiry
            Membership->>Audit: Record invitation action
            Membership->>Mail: Send invitation link
            Mail-->>Invitee: Deliver invitation
            Invitee->>UI: Authenticate and accept
            UI->>Membership: Validate target identity, expiry, account status and required 2FA
            alt Invitation invalid or expired
                Membership-->>UI: Reject or offer owner-managed retry path
            else Invitation valid
                Membership->>Membership: Create active membership and optional team membership
                Membership->>Audit: Record membership change
                Membership-->>UI: Show organization membership
            end
        end
    end

    rect rgb(218, 251, 225)
        Note over Contributor,Audit: Issue creation, participation and closure
        Contributor->>UI: Create issue with title, body and allowed metadata
        UI->>AuthZ: Check repository visibility, issue availability and create permission
        alt Not permitted
            AuthZ-->>UI: Deny creation
        else Permitted
            UI->>Work: Create open issue
            Work->>Notify: Subscribe participant and notify assignees or mentions
            Work->>Audit: Append issue timeline event
            Work-->>UI: Show issue
            Contributor->>UI: Comment or update permitted metadata
            UI->>AuthZ: Evaluate author, repository role and conversation lock
            AuthZ-->>Work: Apply allowed change
            Work->>Notify: Emit subscribed activity
            Owner->>UI: Close as completed or not planned
            UI->>AuthZ: Check author or triage-plus close permission
            AuthZ-->>Work: Apply close reason
            Work->>Audit: Append close event
        end
    end

    rect rgb(246, 248, 250)
        Note over Contributor,Notify: Notification triage
        Notify-->>Contributor: Inbox item with reason
        Contributor->>UI: Mark read, unread, saved, done, or unsubscribe
        UI->>Notify: Persist read status, triage status, and subscription choice
        Notify-->>UI: Return filtered inbox state
    end
```

## Required failure coverage

- duplicate, expired, canceled, flagged-account, unverified-email, required-2FA,
  plan-license, and rate-limit invitation cases;
- policy-denied, role-denied, archived-repository, and locked-conversation issue
  mutations;
- notification participation, mention, watch, custom watch, ignore,
  unsubscribe, done, saved, and retention cases;
- audit/timeline side effects only after the associated command outcome is
  known.
