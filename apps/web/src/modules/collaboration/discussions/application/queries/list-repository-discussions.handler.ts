import type {
  ListRepositoryDiscussionsResult,
  ListRepositoryDiscussionsUseCase,
} from "../ports/inbound/list-repository-discussions.use-case";
import type { DiscussionRepositoryPort } from "../ports/outbound/discussion.repository.port";

export class ListRepositoryDiscussionsHandler
  implements ListRepositoryDiscussionsUseCase
{
  private readonly discussions: DiscussionRepositoryPort;

  constructor(discussions: DiscussionRepositoryPort) {
    this.discussions = discussions;
  }

  async listRepositoryDiscussions(
    repositoryId: string,
  ): Promise<ListRepositoryDiscussionsResult> {
    const discussions = await this.discussions.listByRepository(repositoryId);
    return {
      discussions: discussions.toSorted((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
      ),
      status: "found",
    };
  }
}
