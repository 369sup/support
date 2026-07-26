import type { ActivityItem } from "../../../domain/activity-item";

export interface ActivityFeedRepositoryPort {
  listByRepository(repositoryId: string): Promise<readonly ActivityItem[]>;
}
