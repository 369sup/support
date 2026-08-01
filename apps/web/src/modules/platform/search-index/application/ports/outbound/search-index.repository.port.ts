import type {
  SearchCandidate,
  SearchDocument,
} from "../../../domain/search-document";

export type SearchIndexQuery = Readonly<{
  authorizationKey?: string;
  kind?: string;
  limit: number;
  text: string;
}>;

export interface SearchIndexRepositoryPort {
  findById(documentId: string): Promise<SearchDocument | null>;
  list(): Promise<readonly SearchDocument[]>;
  query?: (query: SearchIndexQuery) => Promise<readonly SearchCandidate[]>;
  remove(documentId: string, expectedVersion?: number): Promise<void>;
  save(document: SearchDocument): Promise<void>;
}
