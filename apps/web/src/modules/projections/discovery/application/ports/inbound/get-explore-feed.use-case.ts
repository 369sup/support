import type { ExploreFeed } from "../../../domain/explore-feed";

export type GetExploreFeedResult = Readonly<{
  feed: ExploreFeed;
  status: "found";
}>;

export interface GetExploreFeedUseCase {
  getExploreFeed(): Promise<GetExploreFeedResult>;
}
