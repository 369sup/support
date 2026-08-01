import type { SearchCandidate } from "../../../domain/search-document";

export type QuerySearchIndexQuery = Readonly<{
  authorizationKey?: string;
  kind?: string;
  limit?: number;
  query: string;
}>;

export type QuerySearchIndexResult = Readonly<{
  status: "found";
  candidates: readonly SearchCandidate[];
}>;

export interface QuerySearchIndexUseCase {
  querySearchIndex(query: QuerySearchIndexQuery): Promise<QuerySearchIndexResult>;
}
