import type { RepositoryViewOwner } from "../ports/inbound/repository-view.types";
import type { RepositoryQuerySnapshot } from "../ports/outbound/repository-query.repository.port";

export function mapRepositoryViewOwner(
  repository: RepositoryQuerySnapshot,
): RepositoryViewOwner {
  return repository.owner.kind === "personal"
    ? {
        kind: "personal",
        accountId: repository.owner.id,
        login: repository.owner.username,
      }
    : {
        kind: "organization",
        organizationId: repository.owner.id,
        login: repository.owner.username,
      };
}
