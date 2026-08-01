import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresExploreFeedAdapter } from "../adapters/outbound/persistence/postgres-explore-feed.adapter";
import { GetExploreFeedHandler } from "../application/queries/get-explore-feed.handler";

const handler = new GetExploreFeedHandler(
  new PostgresExploreFeedAdapter(getProductionDatabase()),
);

export const discoveryServerFacade = {
  getExploreFeed: handler.getExploreFeed.bind(handler),
};
