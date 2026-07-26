import type { SearchIndexRepositoryPort } from "../../../application/ports/outbound/search-index.repository.port";
import type { SearchDocument } from "../../../domain/search-document";

export interface InMemorySearchIndexState {
  documentsById: Map<string, SearchDocument>;
}

declare global {
  var __supportSearchIndexStateV1: InMemorySearchIndexState | undefined;
}

function createState(): InMemorySearchIndexState {
  const fixtures: SearchDocument[] = [
    {
      authorizationKeys: ["public"],
      body: "Support product collaboration, permissions, notifications, issues, and discussions.",
      documentId: "repository:repository_support",
      kind: "repository",
      sourceContext: "repositories/repositories",
      sourceVersion: 1,
      title: "octocat/support",
      version: 1,
    },
    {
      authorizationKeys: ["public"],
      body: "Design the contributor notification inbox with repository subscriptions.",
      documentId: "issue:repository_support:1",
      kind: "issue",
      sourceContext: "collaboration/issues",
      sourceVersion: 1,
      title: "Design the contributor notification inbox",
      version: 1,
    },
    {
      authorizationKeys: ["public"],
      body: "Community questions and answers about contributor collaboration.",
      documentId: "discussion:repository_support:1",
      kind: "discussion",
      sourceContext: "collaboration/discussions",
      sourceVersion: 1,
      title: "How should contributors receive updates?",
      version: 1,
    },
    {
      authorizationKeys: ["public"],
      body: "Plan the Support collaboration MVP across issues, notifications, discussions, and projects.",
      documentId: "project:project_support_collaboration",
      kind: "project",
      sourceContext: "collaboration/projects",
      sourceVersion: 1,
      title: "Support collaboration MVP",
      version: 1,
    },
    {
      authorizationKeys: ["public"],
      body: "Personal profile for the Support development account.",
      documentId: "profile:account_mock",
      kind: "profile",
      sourceContext: "identity/profiles",
      sourceVersion: 1,
      title: "mock",
      version: 1,
    },
  ];
  return {
    documentsById: new Map(
      fixtures.map((document) => [document.documentId, document]),
    ),
  };
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
