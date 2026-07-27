import type {
  ConfirmRepositoryLifecycleCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type UnarchiveRepositoryResult =
  | Readonly<{ status: "unarchived"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "confirmation-mismatch"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found";
    }>;

export interface UnarchiveRepositoryUseCase {
  unarchiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<UnarchiveRepositoryResult>;
}
