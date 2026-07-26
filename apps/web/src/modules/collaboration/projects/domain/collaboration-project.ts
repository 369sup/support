export type ProjectItemStatus = "backlog" | "in-progress" | "done";
export type ProjectItem = Readonly<{
  itemId: string;
  status: ProjectItemStatus;
  title: string;
}>;
export type CollaborationProject = Readonly<{
  description: string;
  items: readonly ProjectItem[];
  linkedRepositoryIds: readonly string[];
  ownerAccountId: string;
  projectId: string;
  state: "open" | "closed";
  title: string;
  updatedAt: string;
}>;
