# Projects

## Purpose

Own user- and organization-scoped projects, their items, fields, views,
workflows, charts, templates, and status updates.

## Context content tree

- Project collaboration [active]
  - `list-account-projects`
  - `list-repository-projects`
  - `update-project-item-status`
  - Owned: `Project`, `ProjectItem`, `ProjectField`, `ProjectStatusUpdate`
- Draft issues, views, workflows, charts, and templates [planned]
  - Owned: `DraftIssue`, `ProjectView`, `ProjectWorkflow`, `ProjectChart`,
    `ProjectTemplate`
- Planned events: `ProjectCreated@1`, `ProjectUpdated@1`,
  `ProjectClosed@1`, `ProjectReopened@1`, `ProjectDeleted@1`,
  `ProjectItemAdded@1`, `ProjectItemUpdated@1`, `ProjectItemRemoved@1`,
  `ProjectViewChanged@1`, `ProjectFieldChanged@1`,
  `ProjectWorkflowChanged@1`, `ProjectStatusUpdated@1`
- Runtime dependencies: none.
- Excludes: `RepositoryOwnership`, `Issue`, `IssueFieldDefinition`.

## Designed use cases

### `list-account-projects` [active]

- **Type:** `query`
- **Application boundary:** `ListAccountProjectsUseCase.listAccountProjects()`
- **Public entrypoint:** `server-api.ts#listAccountProjects`
- **Input:** Authenticated owner account ID.
- **Success result:** `found` with projects owned by the account.
- **Expected rejections:** `none`
- **Authorization:** Delivery supplies the current account only.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-projects-source-01`
- **Local policy:** The active fixture models personal ownership only.

### `list-repository-projects` [active]

- **Type:** `query`
- **Application boundary:** `ListRepositoryProjectsUseCase.listRepositoryProjects()`
- **Public entrypoint:** `server-api.ts#listRepositoryProjects`
- **Input:** Repository ID.
- **Success result:** `found` with linked projects.
- **Expected rejections:** `none`
- **Authorization:** Delivery establishes repository read access.
- **Transaction:** Read-only snapshot.
- **Idempotency:** Query.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-projects-source-01`
- **Local policy:** Linking never implies repository ownership of a project.

### `update-project-item-status` [active]

- **Type:** `command`
- **Application boundary:** `UpdateProjectItemStatusUseCase.updateProjectItemStatus()`
- **Public entrypoint:** `server-api.ts#updateProjectItemStatus`
- **Input:** Project, item, authenticated actor, new status, and timestamp.
- **Success result:** `updated` with the project snapshot.
- **Expected rejections:** `project-not-found`, `item-not-found`, `forbidden`
- **Authorization:** The actor must own the project.
- **Transaction:** Replace one process-local project.
- **Idempotency:** Setting the same status is state-idempotent.
- **Dependencies:** `none`
- **Published events:** `none`
- **Official evidence:** `collaboration-projects-source-01`
- **Local policy:** Status values are `backlog`, `in-progress`, and `done`.

## Ubiquitous language

- **Project:** owner-scoped planning workspace.
- **Project item:** planning row with an active status field.
- **Linked repository:** reference only, not ownership.

## Ownership and invariants

Projects own their items and planning configuration. Only the project owner may
mutate the active status field.

## Public capabilities

Account and repository list queries plus owner-authorized item status updates.

## Dependencies and consistency

The active in-memory slice has no runtime context dependency.

## Authorization

Delivery scopes account lists and repository visibility; the command enforces
project ownership.

## Persistence and transactions

Projects are process-local and non-durable.

## Data classification

Project planning metadata may reference repository resources.

## Retention and erasure

Process lifetime only; durable retention and deletion remain planned.

## Events and failure behavior

Project events remain planned until transactional publication exists.

## Official sources

- <https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects>

## Exceptions

None.
