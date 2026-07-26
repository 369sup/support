import type { ExploreFeed } from "../../../domain/explore-feed";

export interface ExploreFeedRepositoryPort {
  get(): Promise<ExploreFeed>;
}
