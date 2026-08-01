export type PublicSearchCandidate = Readonly<{
  documentId: string;
  kind: string;
  score: number;
  title: string;
}>;

export interface PublicSearchIndexGatewayPort {
  queryPublic(query: string): Promise<readonly PublicSearchCandidate[]>;
}
