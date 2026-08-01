import type { SearchIndexRepositoryPort } from "../../../application/ports/outbound/search-index.repository.port";
import type { SearchDocument } from "../../../domain/search-document";

export interface InMemorySearchIndexState {
  documentsById: Map<string, SearchDocument>;
}

declare global {
  var __supportSearchIndexStateV1: InMemorySearchIndexState | undefined;
}

function createState(): InMemorySearchIndexState {
  return { documentsById: new Map() };
}

function getProcessState() {
  globalThis.__supportSearchIndexStateV1 ??= createState();
  return globalThis.__supportSearchIndexStateV1;
}

export class InMemorySearchIndexAdapter
  implements SearchIndexRepositoryPort
{
  private readonly state: InMemorySearchIndexState;

  static createState() {
    return createState();
  }

  constructor(state: InMemorySearchIndexState = getProcessState()) {
    this.state = state;
  }

  findById(documentId: string) {
    return Promise.resolve(this.state.documentsById.get(documentId) ?? null);
  }

  list() {
    return Promise.resolve([...this.state.documentsById.values()]);
  }

  remove(documentId: string) {
    this.state.documentsById.delete(documentId);
    return Promise.resolve();
  }

  reset() {
    this.state.documentsById.clear();
  }

  save(document: SearchDocument) {
    this.state.documentsById.set(document.documentId, document);
    return Promise.resolve();
  }
}
