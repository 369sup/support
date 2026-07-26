import type { ProjectRepositoryPort } from "../../../application/ports/outbound/project.repository.port";
import type { CollaborationProject } from "../../../contracts/collaboration-project";

type ProjectStore = Map<string, CollaborationProject>;

declare global {
  var __supportProjectStoreV1: ProjectStore | undefined;
}

function createStore(): ProjectStore {
  const fixture: CollaborationProject = {
    description:
      "Coordinate the code-free collaboration capabilities implemented by Support.",
    items: [
      {
        itemId: "project_item_notifications",
        status: "in-progress",
        title: "Notification inbox",
      },
      {
        itemId: "project_item_discussions",
        status: "backlog",
        title: "Discussion conversations",
      },
      {
        itemId: "project_item_profile",
        status: "done",
        title: "Personal profile",
      },
    ],
    linkedRepositoryIds: ["repository_support"],
    ownerAccountId: "account_mock",
    projectId: "project_support_collaboration",
    state: "open",
    title: "Support collaboration MVP",
    updatedAt: "2026-07-27T01:00:00.000Z",
  };
  return new Map([[fixture.projectId, fixture]]);
}

function getProcessStore(): ProjectStore {
  globalThis.__supportProjectStoreV1 ??= createStore();
  return globalThis.__supportProjectStoreV1;
}

export class InMemoryProjectAdapter implements ProjectRepositoryPort {
  private readonly projects: ProjectStore;

  constructor(projects: ProjectStore = getProcessStore()) {
    this.projects = projects;
  }

  find(projectId: string) {
    return Promise.resolve(this.projects.get(projectId) ?? null);
  }

  listByAccount(accountId: string) {
    return Promise.resolve(
      [...this.projects.values()].filter(
        (project) => project.ownerAccountId === accountId,
      ),
    );
  }

  listByRepository(repositoryId: string) {
    return Promise.resolve(
      [...this.projects.values()].filter((project) =>
        project.linkedRepositoryIds.includes(repositoryId),
      ),
    );
  }

  replace(project: CollaborationProject) {
    this.projects.set(project.projectId, project);
    return Promise.resolve();
  }
}
