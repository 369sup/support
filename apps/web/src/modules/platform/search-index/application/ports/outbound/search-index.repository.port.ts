import type { SearchDocument } from "../../../domain/search-document";

export interface SearchIndexRepositoryPort {
  findById(documentId: string): Promise<SearchDocument | null>;
  list(): Promise<readonly SearchDocument[]>;
  remove(documentId: string): Promise<void>;
  save(document: SearchDocument): Promise<void>;
}
