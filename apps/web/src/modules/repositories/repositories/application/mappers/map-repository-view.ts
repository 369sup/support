import type {
  RepositoryViewPermission,
  RepositoryViewReference,
} from "../ports/inbound/repository-view.types";
import type { RepositoryQuerySnapshot } from "../ports/outbound/repository-query.repository.port";
import { mapRepositoryViewOwner } from "./map-repository-view-owner";

export function mapRepositoryView(
  repository: RepositoryQuerySnapshot,
  permission: RepositoryViewPermission,
): RepositoryViewReference {
  if (repository.lifecycleState === "deleted") {
    throw new Error("Deleted repositories cannot be mapped to a view.");
  }
  return {
    repositoryId: repository.repositoryId,
    owner: mapRepositoryViewOwner(repository),
    name: repository.name,
    description: repository.description,
    homepage: repository.homepage,
    visibility: repository.visibility,
    lifecycleState: repository.lifecycleState,
    permission,
    updatedAt: repository.updatedAt,
  };
}
