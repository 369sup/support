import type {
  CollaborationProject,
  ProjectItemStatus,
} from "../../../domain/collaboration-project";

export type UpdateProjectItemStatusCommand = Readonly<{
  actorAccountId: string;
  itemId: string;
  projectId: string;
  status: ProjectItemStatus;
  updatedAt: string;
}>;

export type UpdateProjectItemStatusResult =
  | Readonly<{ project: CollaborationProject; status: "updated" }>
  | Readonly<{ status: "project-not-found" | "item-not-found" | "forbidden" }>;

export interface UpdateProjectItemStatusUseCase {
  updateProjectItemStatus(
    command: UpdateProjectItemStatusCommand,
  ): Promise<UpdateProjectItemStatusResult>;
}
