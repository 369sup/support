import type {
  GetRepositoryForAdministrationQuery,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type GetRepositoryForAdministrationResult =
  | Readonly<{ status: "found"; repository: RepositoryQuerySnapshot }>
  | Readonly<{ status: "permission-denied" | "repository-not-found" }>;

export interface GetRepositoryForAdministrationUseCase {
  getRepositoryForAdministration(
    query: GetRepositoryForAdministrationQuery,
  ): Promise<GetRepositoryForAdministrationResult>;
}
