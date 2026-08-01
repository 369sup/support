import { searchServerFacade } from "./composition/search.composition";

export type {
  SearchResultItem,
  SearchResultKind,
} from "./contracts/search-result";
export const searchPublicResources =
  searchServerFacade.searchPublicResources;
