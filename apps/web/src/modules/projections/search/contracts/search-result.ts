export type SearchResultKind =
  | "discussion"
  | "issue"
  | "profile"
  | "project"
  | "repository";

export type SearchResultItem = Readonly<{
  documentId: string;
  href: string;
  kind: SearchResultKind;
  score: number;
  title: string;
}>;
