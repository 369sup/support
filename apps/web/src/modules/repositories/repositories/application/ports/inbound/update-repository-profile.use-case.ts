import type { UpdateRepositoryProfileCommand } from "./repository-management.types";
import type { RepositoryQuerySnapshot } from "../outbound/repository-query.repository.port";

export type UpdateRepositoryProfileResult =
  | Readonly<{
      status: "profile-updated";
      repository: RepositoryQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "invalid-description"
        | "invalid-homepage"
        | "invalid-state"
        | "permission-denied"
        | "repository-not-found";
    }>;

export interface UpdateRepositoryProfileUseCase {
  updateRepositoryProfile(
    command: UpdateRepositoryProfileCommand,
  ): Promise<UpdateRepositoryProfileResult>;
}
