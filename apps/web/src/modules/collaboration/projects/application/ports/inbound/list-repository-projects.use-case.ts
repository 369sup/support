import type { CollaborationProject } from "../../../domain/collaboration-project";

export type ListRepositoryProjectsResult = Readonly<{
  projects: readonly CollaborationProject[];
  status: "found";
}>;

export interface ListRepositoryProjectsUseCase {
  listRepositoryProjects(
    repositoryId: string,
  ): Promise<ListRepositoryProjectsResult>;
}
