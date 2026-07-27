import type {
  ConfirmRepositoryLifecycleCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type ArchiveRepositoryResult =
  | Readonly<{ status: "archived"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "confirmation-mismatch"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found";
    }>;

export interface ArchiveRepositoryUseCase {
  archiveRepository(
    command: ConfirmRepositoryLifecycleCommand,
  ): Promise<ArchiveRepositoryResult>;
}
