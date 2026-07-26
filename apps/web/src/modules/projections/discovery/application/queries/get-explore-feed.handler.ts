import type {
  GetExploreFeedResult,
  GetExploreFeedUseCase,
} from "../ports/inbound/get-explore-feed.use-case";
import type { ExploreFeedRepositoryPort } from "../ports/outbound/explore-feed.repository.port";

export class GetExploreFeedHandler implements GetExploreFeedUseCase {
  private readonly feeds: ExploreFeedRepositoryPort;

  constructor(feeds: ExploreFeedRepositoryPort) {
    this.feeds = feeds;
  }

  async getExploreFeed(): Promise<GetExploreFeedResult> {
    return { feed: await this.feeds.get(), status: "found" };
  }
}
