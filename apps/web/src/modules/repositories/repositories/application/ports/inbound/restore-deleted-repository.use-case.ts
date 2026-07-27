import type {
  ConfirmRepositoryLifecycleCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type RestoreDeletedRepositoryResult =
  | Readonly<{ status: "restored"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "confirmation-mismatch"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found"
        | "restore-window-expired";
    }>;

export interface RestoreDeletedRepositoryUseCase {
  restoreDeletedRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<RestoreDeletedRepositoryResult>;
}
