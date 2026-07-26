import { discoveryServerFacade } from "./composition/discovery.composition";

export type {
  ExploreFeed,
  ExploreRepositoryCard,
} from "./contracts/explore-feed";
export const getExploreFeed = discoveryServerFacade.getExploreFeed;
