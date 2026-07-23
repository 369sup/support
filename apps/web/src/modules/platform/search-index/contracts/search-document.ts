export type SearchDocumentReference = Readonly<{
  authorizationKeys: readonly string[];
  body: string;
  documentId: string;
  kind: string;
  sourceContext: string;
  sourceVersion: number;
  title: string;
  version: number;
}>;

export type SearchCandidateReference = Readonly<{
  authorizationKeys: readonly string[];
  documentId: string;
  kind: string;
  score: number;
  sourceContext: string;
  sourceVersion: number;
  title: string;
}>;
