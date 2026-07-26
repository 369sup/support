import type { CollaborationProject } from "../../../domain/collaboration-project";

export type ListAccountProjectsResult = Readonly<{
  projects: readonly CollaborationProject[];
  status: "found";
}>;

export interface ListAccountProjectsUseCase {
  listAccountProjects(
    accountId: string,
  ): Promise<ListAccountProjectsResult>;
}
