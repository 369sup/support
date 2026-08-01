import type { ActivityItem } from "../../../domain/activity-item";

export type ListRepositoryActivityResult =
  | Readonly<{ status: "found"; items: readonly ActivityItem[] }>
  | Readonly<{ status: "invalid-repository-id" }>;

export interface ListRepositoryActivityUseCase {
  listRepositoryActivity(
    repositoryId: string,
  ): Promise<ListRepositoryActivityResult>;
}
