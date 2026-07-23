export type SearchDocument = Readonly<{
  authorizationKeys: readonly string[];
  body: string;
  documentId: string;
  kind: string;
  sourceContext: string;
  sourceVersion: number;
  title: string;
  version: number;
}>;

export type SearchCandidate = Readonly<{
  authorizationKeys: readonly string[];
  documentId: string;
  kind: string;
  score: number;
  sourceContext: string;
  sourceVersion: number;
  title: string;
}>;

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function calculateSearchScore(
  document: SearchDocument,
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query);
  const title = normalizeSearchText(document.title);
  const body = normalizeSearchText(document.body);
  if (title === normalizedQuery) {
    return 3;
  }
  if (title.includes(normalizedQuery)) {
    return 2;
  }
  return body.includes(normalizedQuery) ? 1 : 0;
}
