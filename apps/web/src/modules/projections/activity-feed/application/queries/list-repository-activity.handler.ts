import type {
  ListRepositoryActivityResult,
  ListRepositoryActivityUseCase,
} from "../ports/inbound/list-repository-activity.use-case";
import type { ActivityFeedRepositoryPort } from "../ports/outbound/activity-feed.repository.port";

export class ListRepositoryActivityHandler
  implements ListRepositoryActivityUseCase
{
  private readonly activity: ActivityFeedRepositoryPort;

  constructor(activity: ActivityFeedRepositoryPort) {
    this.activity = activity;
  }

  async listRepositoryActivity(
    repositoryId: string,
  ): Promise<ListRepositoryActivityResult> {
    if (repositoryId.trim().length === 0) {
      return { status: "invalid-repository-id" };
    }
    return {
      status: "found",
      items: (await this.activity.listByRepository(repositoryId)).toSorted(
        (left, right) => right.occurredAt.localeCompare(left.occurredAt),
      ),
    };
  }
}
