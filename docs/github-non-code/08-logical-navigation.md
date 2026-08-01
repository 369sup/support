# Logical Navigation

This diagram defines reachable destinations and navigation responsibilities.
Labels are logical screens, not literal GitHub or Support URLs. A separate route
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

## Navigation invariants

- Public navigation exposes only resources visible to the visitor.
- Authentication returns the user to a valid destination or the personal
  dashboard; it never creates product authorization by itself.
- Menus and direct navigation use the same authorization decision.
- Search results and notification deep links re-evaluate current visibility and
  state.
- Project visibility does not reveal inaccessible private-repository items.
- Administrative destinations appear only for actors with the corresponding
  scoped permission.
