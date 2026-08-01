import type {
  RemoveSearchDocumentCommand,
  RemoveSearchDocumentResult,
  RemoveSearchDocumentUseCase,
} from "../ports/inbound/remove-search-document.use-case";
import type { SearchIndexRepositoryPort } from "../ports/outbound/search-index.repository.port";

export class RemoveSearchDocumentHandler
  implements RemoveSearchDocumentUseCase
{
  private readonly repository: SearchIndexRepositoryPort;

  constructor(repository: SearchIndexRepositoryPort) {
    this.repository = repository;
  }

  async removeSearchDocument(
    command: RemoveSearchDocumentCommand,
  ): Promise<RemoveSearchDocumentResult> {
    const current = await this.repository.findById(command.documentId);
    if (current === null) {
      return { status: "document-not-found" };
    }
    if (current.version !== command.expectedVersion) {
      return {
        status: "version-conflict",
        currentVersion: current.version,
      };
    }
    await this.repository.remove(command.documentId);
    return { status: "removed" };
  }
}
