import type {
  RenameRepositoryCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type RenameRepositoryResult =
  | Readonly<{ status: "renamed"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "invalid-name"
        | "invalid-state"
        | "permission-denied"
        | "repository-name-conflict"
        | "repository-not-found";
    }>;

export interface RenameRepositoryUseCase {
  renameRepository(
    command: RenameRepositoryCommand,
  ): Promise<RenameRepositoryResult>;
}
