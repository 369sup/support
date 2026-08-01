import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type ListBrowserAccountSessionsQuery = Readonly<{
  browserToken: string;
}>;
export type BrowserAccountSessionSnapshot =
  ResolvedAccountSessionSnapshot & Readonly<{ isCurrent: boolean }>;
export type ListBrowserAccountSessionsResult =
  | Readonly<{
      status: "found";
      sessions: readonly BrowserAccountSessionSnapshot[];
    }>
  | Readonly<{ status: "browser-session-not-found" }>;

export interface ListBrowserAccountSessionsUseCase {
  listBrowserAccountSessions(
    query: ListBrowserAccountSessionsQuery,
  ): Promise<ListBrowserAccountSessionsResult>;
}
