import { PublicSearchIndexAdapter } from "../adapters/outbound/integration/public-search-index.adapter";
import { SearchPublicResourcesHandler } from "../application/queries/search-public-resources.handler";

const handler = new SearchPublicResourcesHandler(new PublicSearchIndexAdapter());

export const searchServerFacade = {
  searchPublicResources: handler.searchPublicResources.bind(handler),
};
