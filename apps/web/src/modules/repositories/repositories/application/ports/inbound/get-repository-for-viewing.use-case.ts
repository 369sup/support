import type { RepositoryViewReference } from "./repository-view.types";

export type GetRepositoryForViewingQuery = Readonly<{
  actorAccountId: string;
  ownerId: string;
  name: string;
}>;

export type GetRepositoryForViewingResult =
  | Readonly<{ status: "found"; repository: RepositoryViewReference }>
  | Readonly<{ status: "repository-not-found" }>;

export interface GetRepositoryForViewingUseCase {
  getRepositoryForViewing(
    query: GetRepositoryForViewingQuery,
  ): Promise<GetRepositoryForViewingResult>;
}
