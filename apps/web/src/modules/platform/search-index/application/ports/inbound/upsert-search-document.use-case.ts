import type { SearchDocument } from "../../../domain/search-document";

export type UpsertSearchDocumentCommand = Readonly<{
  authorizationKeys: readonly string[];
  body: string;
  documentId: string;
  expectedVersion: number | null;
  kind: string;
  sourceContext: string;
  sourceVersion: number;
  title: string;
}>;

export type UpsertSearchDocumentResult =
  | Readonly<{ status: "upserted"; document: SearchDocument }>
  | Readonly<{ status: "version-conflict"; currentVersion: number }>;

export interface UpsertSearchDocumentUseCase {
  upsertSearchDocument(
    command: UpsertSearchDocumentCommand,
  ): Promise<UpsertSearchDocumentResult>;
}
