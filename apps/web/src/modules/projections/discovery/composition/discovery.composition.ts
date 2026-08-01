import { InMemoryExploreFeedAdapter } from "../adapters/outbound/persistence/in-memory-explore-feed.adapter";
import { GetExploreFeedHandler } from "../application/queries/get-explore-feed.handler";

const handler = new GetExploreFeedHandler(new InMemoryExploreFeedAdapter());

export const discoveryServerFacade = {
  getExploreFeed: handler.getExploreFeed.bind(handler),
};
