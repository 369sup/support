import type {
  UpsertSearchDocumentCommand,
  UpsertSearchDocumentResult,
  UpsertSearchDocumentUseCase,
} from "../ports/inbound/upsert-search-document.use-case";
import type { SearchIndexRepositoryPort } from "../ports/outbound/search-index.repository.port";

export class UpsertSearchDocumentHandler
  implements UpsertSearchDocumentUseCase
{
  private readonly repository: SearchIndexRepositoryPort;

  constructor(repository: SearchIndexRepositoryPort) {
    this.repository = repository;
  }

  async upsertSearchDocument(
    command: UpsertSearchDocumentCommand,
  ): Promise<UpsertSearchDocumentResult> {
    const current = await this.repository.findById(command.documentId);
    const currentVersion = current?.version ?? 0;
    if (
      (current === null && command.expectedVersion !== null) ||
      (current !== null && command.expectedVersion !== current.version)
    ) {
      return { status: "version-conflict", currentVersion };
    }
    const document = {
      authorizationKeys: [...new Set(command.authorizationKeys)].sort(),
      body: command.body,
      documentId: command.documentId,
      kind: command.kind,
      sourceContext: command.sourceContext,
      sourceVersion: command.sourceVersion,
      title: command.title,
      version: currentVersion + 1,
    };
    await this.repository.save(document);
    return { status: "upserted", document };
  }
}
