export type RemoveSearchDocumentCommand = Readonly<{
  documentId: string;
  expectedVersion: number;
}>;

export type RemoveSearchDocumentResult =
  | Readonly<{ status: "removed" }>
  | Readonly<{ status: "document-not-found" }>
  | Readonly<{ status: "version-conflict"; currentVersion: number }>;

export interface RemoveSearchDocumentUseCase {
  removeSearchDocument(
    command: RemoveSearchDocumentCommand,
  ): Promise<RemoveSearchDocumentResult>;
}
