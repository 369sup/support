import type { CollaborationProject } from "../../../domain/collaboration-project";

export interface ProjectRepositoryPort {
  find(projectId: string): Promise<CollaborationProject | null>;
  listByAccount(accountId: string): Promise<readonly CollaborationProject[]>;
  listByRepository(
    repositoryId: string,
  ): Promise<readonly CollaborationProject[]>;
  replace(project: CollaborationProject): Promise<void>;
}
