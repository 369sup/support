import type {
  ConfirmRepositoryLifecycleCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type DeleteRepositoryResult =
  | Readonly<{ status: "deleted"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "confirmation-mismatch"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found";
    }>;

export interface DeleteRepositoryUseCase {
  deleteRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<DeleteRepositoryResult>;
}
