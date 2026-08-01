# Discussions Bounded Context

- **Catalog path:** `collaboration/discussions`
- **Kind:** `domain`
- **Classification:** `core`
- **Maturity:** `stable`
- **Implementation:** `planned`
- **Semantic status:** `validated`

## Purpose

Repository discussion forums and organization discussion spaces, source-repository binding, categories, sections, polls, answers, pins, and lifecycle.

## Context content tree

- `collaboration/discussions` [planned]
  - Purpose: Repository discussion forums and organization discussion spaces, source-repository binding, categories, sections, polls, answers, pins, and lifecycle.
  - Capabilities
    - No active use cases; activation scope remains empty.
  - Owned domain concepts
    - `RepositoryDiscussionForum`
    - `OrganizationDiscussionSpace`
    - `Discussion`
    - `DiscussionCategory`
    - `DiscussionSection`
    - `DiscussionPoll`
    - `AcceptedAnswer`
    - `PinnedDiscussion`
  - Business rules and invariants
    - `discussion-forums-and-categories`: Repositories and organizations expose discussion forums with up to 25 uniquely named-and-emoji-paired categories; each category can belong to at most one section, category deletion moves discussions to another category, and section deletion leaves categories unsectioned.
    - `discussion-lifecycle-and-transfer`: Discussions can be closed, reopened, deleted with their replies, or transferred subject to GitHub's repository and announcement restrictions.
    - `discussion-answers-polls-and-pins`: Answerable discussions support marking eligible non-minimized comments as answers, discussions can be pinned, and poll discussions require at least two options without claiming a separate poll-close operation.
    - `organization-discussion-source-repository`: Organization Discussions requires an organization-owned source repository and derives permissions from it.
    - `organization-discussion-source-change`: Changing the Organization Discussions source repository does not transfer existing discussions.
  - Published events
    - `DiscussionCreated@1` [planned]: discussion created.
    - `DiscussionUpdated@1` [planned]: discussion updated.
    - `DiscussionClosed@1` [planned]: discussion closed.
    - `DiscussionReopened@1` [planned]: discussion reopened.
    - `DiscussionDeleted@1` [planned]: discussion and its replies deleted.
    - `DiscussionTransferred@1` [planned]: discussion transferred.
    - `DiscussionCategoryCreated@1` [planned]: discussion category created.
    - `DiscussionCategoryUpdated@1` [planned]: discussion category updated.
    - `DiscussionCategoryDeleted@1` [planned]: discussion category deleted after its discussions were moved to a selected existing category.
    - `DiscussionSectionCreated@1` [planned]: discussion section created.
    - `DiscussionSectionUpdated@1` [planned]: discussion section updated.
    - `DiscussionSectionDeleted@1` [planned]: discussion section deleted while its categories remained unsectioned.
    - `DiscussionAnswerMarked@1` [planned]: discussion answer marked.
    - `DiscussionAnswerUnmarked@1` [planned]: discussion answer unmarked.
    - `DiscussionPinned@1` [planned]: discussion pinned.
    - `DiscussionUnpinned@1` [planned]: discussion unpinned.
    - `OrganizationDiscussionSpaceEnabled@1` [planned]: organization discussion space enabled with a source repository.
    - `OrganizationDiscussionSpaceDisabled@1` [planned]: organization discussion space disabled.
    - `OrganizationDiscussionSourceChanged@1` [planned]: organization discussion source repository changed without transferring existing discussions.
- External relationships
  - Runtime dependencies: none.
  - Planned relationships
    - `repositories/repositories::RepositoryLifecycleAndOwnership` (synchronous)
    - `organizations/organizations::OrganizationReference` (synchronous)
    - `repositories/repository-access::DiscussionPermission` (synchronous)
    - `repositories/repository-features::RepositoryDiscussionFeatureState` (synchronous)
    - `repositories/repository-features::RepositoryDiscussionFeatureEvents` (event; events `RepositoryDiscussionsEnabled@1`, `RepositoryDiscussionsDisabled@1`)
    - `collaboration/labels-and-milestones::LabelReference` (synchronous)
    - `collaboration/conversations::DiscussionConversation` (synchronous)
    - `organizations/organization-memberships::OrganizationDiscussionAdministration` (synchronous)
    - `organizations/organization-policies::DiscussionCreationPolicy` (synchronous)
- Explicit exclusions
  - `Comment`
  - `LabelDefinition`
  - `Issue`
  - `TeamDiscussion`

## Designed use cases

No approved use cases. Implementation remains blocked.

## Ubiquitous language

The catalog reserves these terms for this context:

- `RepositoryDiscussionForum`
- `OrganizationDiscussionSpace`
- `Discussion`
- `DiscussionCategory`
- `DiscussionSection`
- `DiscussionPoll`
- `AcceptedAnswer`
- `PinnedDiscussion`

Precise definitions must be refined against the official sources before activation.

## Ownership and invariants

This context owns `RepositoryDiscussionForum`, `OrganizationDiscussionSpace`, `Discussion`, `DiscussionCategory`, `DiscussionSection`, `DiscussionPoll`, `AcceptedAnswer`, `PinnedDiscussion`.
It excludes `Comment`, `LabelDefinition`, `Issue`, `TeamDiscussion`.

- `discussion-forums-and-categories`: Repositories and organizations expose discussion forums with up to 25 uniquely named-and-emoji-paired categories; each category can belong to at most one section, category deletion moves discussions to another category, and section deletion leaves categories unsectioned.
  - Ownership: `RepositoryDiscussionForum`, `Discussion`, `DiscussionCategory`, `DiscussionSection`
  - Events: `DiscussionCreated@1`, `DiscussionUpdated@1`, `DiscussionCategoryCreated@1`, `DiscussionCategoryUpdated@1`, `DiscussionCategoryDeleted@1`, `DiscussionSectionCreated@1`, `DiscussionSectionUpdated@1`, `DiscussionSectionDeleted@1`
  - Sources: `collaboration-discussions-source-01`, `collaboration-discussions-source-05`, `collaboration-discussions-source-08`
- `discussion-lifecycle-and-transfer`: Discussions can be closed, reopened, deleted with their replies, or transferred subject to GitHub's repository and announcement restrictions.
  - Ownership: none
  - Events: `DiscussionClosed@1`, `DiscussionReopened@1`, `DiscussionDeleted@1`, `DiscussionTransferred@1`
  - Sources: `collaboration-discussions-source-02`, `collaboration-discussions-source-05`, `collaboration-discussions-source-08`
- `discussion-answers-polls-and-pins`: Answerable discussions support marking eligible non-minimized comments as answers, discussions can be pinned, and poll discussions require at least two options without claiming a separate poll-close operation.
  - Ownership: `DiscussionPoll`, `AcceptedAnswer`, `PinnedDiscussion`
  - Events: `DiscussionAnswerMarked@1`, `DiscussionAnswerUnmarked@1`, `DiscussionPinned@1`, `DiscussionUnpinned@1`
  - Sources: `collaboration-discussions-source-02`, `collaboration-discussions-source-06`, `collaboration-discussions-source-07`, `collaboration-discussions-source-08`
- `organization-discussion-source-repository`: Organization Discussions requires an organization-owned source repository and derives permissions from it.
  - Ownership: `OrganizationDiscussionSpace`
  - Events: `OrganizationDiscussionSpaceEnabled@1`, `OrganizationDiscussionSpaceDisabled@1`
  - Sources: `collaboration-discussions-source-04`
- `organization-discussion-source-change`: Changing the Organization Discussions source repository does not transfer existing discussions.
  - Ownership: none
  - Events: `OrganizationDiscussionSourceChanged@1`
  - Sources: `collaboration-discussions-source-04`

## Public capabilities

None while planned. Activation requires at least one real use case and public consumer.

## Dependencies and consistency

### Runtime dependencies

None.

### Planned relationships

- `repositories/repositories::RepositoryLifecycleAndOwnership` (synchronous)
- `organizations/organizations::OrganizationReference` (synchronous)
- `repositories/repository-access::DiscussionPermission` (synchronous)
- `repositories/repository-features::RepositoryDiscussionFeatureState` (synchronous)
- `repositories/repository-features::RepositoryDiscussionFeatureEvents` (event; events `RepositoryDiscussionsEnabled@1`, `RepositoryDiscussionsDisabled@1`)
- `collaboration/labels-and-milestones::LabelReference` (synchronous)
- `collaboration/conversations::DiscussionConversation` (synchronous)
- `organizations/organization-memberships::OrganizationDiscussionAdministration` (synchronous)
- `organizations/organization-policies::DiscussionCreationPolicy` (synchronous)

## Authorization

Authorization policy ownership and resource-scope rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Persistence and transactions

Persistence ownership and transaction boundaries are not defined while this context is planned. They must be decided and reviewed before activation.

## Data classification

Sensitive-data classification and redaction rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Retention and erasure

Retention, erasure, and tombstone rules are not defined while this context is planned. They must be decided and reviewed before activation.

## Events and failure behavior

- `DiscussionCreated@1` (domain, planned): discussion created. contract and ordering pending activation.
- `DiscussionUpdated@1` (domain, planned): discussion updated. contract and ordering pending activation.
- `DiscussionClosed@1` (domain, planned): discussion closed. contract and ordering pending activation.
- `DiscussionReopened@1` (domain, planned): discussion reopened. contract and ordering pending activation.
- `DiscussionDeleted@1` (domain, planned): discussion and its replies deleted. contract and ordering pending activation.
- `DiscussionTransferred@1` (domain, planned): discussion transferred. contract and ordering pending activation.
- `DiscussionCategoryCreated@1` (domain, planned): discussion category created. contract and ordering pending activation.
- `DiscussionCategoryUpdated@1` (domain, planned): discussion category updated. contract and ordering pending activation.
- `DiscussionCategoryDeleted@1` (domain, planned): discussion category deleted after its discussions were moved to a selected existing category. contract and ordering pending activation.
- `DiscussionSectionCreated@1` (domain, planned): discussion section created. contract and ordering pending activation.
- `DiscussionSectionUpdated@1` (domain, planned): discussion section updated. contract and ordering pending activation.
- `DiscussionSectionDeleted@1` (domain, planned): discussion section deleted while its categories remained unsectioned. contract and ordering pending activation.
- `DiscussionAnswerMarked@1` (domain, planned): discussion answer marked. contract and ordering pending activation.
- `DiscussionAnswerUnmarked@1` (domain, planned): discussion answer unmarked. contract and ordering pending activation.
- `DiscussionPinned@1` (domain, planned): discussion pinned. contract and ordering pending activation.
- `DiscussionUnpinned@1` (domain, planned): discussion unpinned. contract and ordering pending activation.
- `OrganizationDiscussionSpaceEnabled@1` (domain, planned): organization discussion space enabled with a source repository. contract and ordering pending activation.
- `OrganizationDiscussionSpaceDisabled@1` (domain, planned): organization discussion space disabled. contract and ordering pending activation.
- `OrganizationDiscussionSourceChanged@1` (domain, planned): organization discussion source repository changed without transferring existing discussions. contract and ordering pending activation.

## Official sources

- `collaboration-discussions-source-01`: [repository discussions, organization discussions, discussion categories](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/about-discussions) (verified 2026-07-22)
- `collaboration-discussions-source-02`: [pins, transfer, discussion lifecycle](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-discussions) (verified 2026-07-23)
- `collaboration-discussions-source-03`: [repository discussion availability prerequisite](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/enabling-or-disabling-github-discussions-for-a-repository) (verified 2026-07-22)
- `collaboration-discussions-source-04`: [organization discussion enablement, source repository, source-repository permissions](https://docs.github.com/en/enterprise-cloud@latest/organizations/managing-organization-settings/enabling-or-disabling-github-discussions-for-an-organization) (verified 2026-07-22)
- `collaboration-discussions-source-05`: [discussion category lifecycle, discussion section lifecycle, category and section invariants, announcement transfer restriction](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions) (verified 2026-07-23)
- `collaboration-discussions-source-06`: [accepted answer eligibility, marking and unmarking answers](https://docs.github.com/en/discussions/managing-discussions-for-your-community/moderating-discussions) (verified 2026-07-23)
- `collaboration-discussions-source-07`: [discussion polls, poll option minimum, answer authority](https://docs.github.com/en/discussions/collaborating-with-your-community-using-discussions/participating-in-a-discussion) (verified 2026-07-23)
- `collaboration-discussions-source-08`: [discussion create and update, discussion close and reopen, discussion deletion, accepted answer mutations, poll voting without a poll-close mutation](https://docs.github.com/en/graphql/reference/discussions) (verified 2026-07-23)

## Exceptions

No context-specific exception is declared by the catalog. The central
[exception registry](../../../../../../docs/architecture/exceptions/registry.json) remains authoritative.
