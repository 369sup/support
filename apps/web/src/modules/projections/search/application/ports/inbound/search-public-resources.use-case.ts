import type { SearchResultItem } from "../../../domain/search-result";

export type SearchPublicResourcesResult = Readonly<{
  status: "found";
  results: readonly SearchResultItem[];
}>;

export interface SearchPublicResourcesUseCase {
  searchPublicResources(query: string): Promise<SearchPublicResourcesResult>;
}
