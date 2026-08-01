import type {
  GetRepositoryDiscussionQuery,
  GetRepositoryDiscussionResult,
  GetRepositoryDiscussionUseCase,
} from "../ports/inbound/get-repository-discussion.use-case";
import type { DiscussionRepositoryPort } from "../ports/outbound/discussion.repository.port";

export class GetRepositoryDiscussionHandler
  implements GetRepositoryDiscussionUseCase
{
  private readonly discussions: DiscussionRepositoryPort;

  constructor(discussions: DiscussionRepositoryPort) {
    this.discussions = discussions;
  }

  async getRepositoryDiscussion(
    query: GetRepositoryDiscussionQuery,
  ): Promise<GetRepositoryDiscussionResult> {
    const discussion = await this.discussions.findByRepositoryAndNumber(
      query.repositoryId,
      query.number,
    );
    return discussion === null
      ? { status: "discussion-not-found" }
      : { discussion, status: "found" };
  }
}
