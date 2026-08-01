import type {
  CreateEmptyRepositoryCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type CreateEmptyRepositoryResult =
  | Readonly<{ status: "created"; repository: RepositoryQuerySnapshot }>
  | Readonly<{
      status:
        | "internal-visibility-not-available"
        | "invalid-description"
        | "invalid-name"
        | "invalid-visibility"
        | "permission-denied"
        | "repository-name-conflict";
    }>;

export interface CreateEmptyRepositoryUseCase {
  createEmptyRepository(
    command: CreateEmptyRepositoryCommand,
  ): Promise<CreateEmptyRepositoryResult>;
}
