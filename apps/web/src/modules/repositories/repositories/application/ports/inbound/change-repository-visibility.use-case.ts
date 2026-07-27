import type {
  ChangeRepositoryVisibilityCommand,
} from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type ChangeRepositoryVisibilityResult =
  | Readonly<{
      status: "visibility-changed";
      repository: RepositoryQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "internal-visibility-not-available"
        | "invalid-state"
        | "invalid-visibility"
        | "permission-denied"
        | "repository-not-found";
    }>;

export interface ChangeRepositoryVisibilityUseCase {
  changeRepositoryVisibility(
    command: ChangeRepositoryVisibilityCommand,
  ): Promise<ChangeRepositoryVisibilityResult>;
}
