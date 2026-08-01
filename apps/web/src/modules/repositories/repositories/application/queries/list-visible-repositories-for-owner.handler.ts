import type {
  ListVisibleRepositoriesForOwnerQuery,
  ListVisibleRepositoriesForOwnerUseCase,
} from "../ports/inbound/list-visible-repositories-for-owner.use-case";
import type { RepositoryQueryRepositoryPort } from "../ports/outbound/repository-query.repository.port";
import type { RepositoryViewAuthorizationGatewayPort } from "../ports/outbound/repository-view-authorization.gateway.port";
import type { RepositoryListItem } from "../ports/inbound/repository-view.types";
import { mapRepositoryView } from "../mappers/map-repository-view";

export class ListVisibleRepositoriesForOwnerHandler
  implements ListVisibleRepositoriesForOwnerUseCase
{
  private readonly repository: RepositoryQueryRepositoryPort;
  private readonly authorization: RepositoryViewAuthorizationGatewayPort;

  constructor(
    repository: RepositoryQueryRepositoryPort,
    authorization: RepositoryViewAuthorizationGatewayPort,
  ) {
    this.repository = repository;
    this.authorization = authorization;
  }

  async listVisibleRepositoriesForOwner(
    query: ListVisibleRepositoriesForOwnerQuery,
  ): Promise<readonly RepositoryListItem[]> {
    const repositories = await this.repository.findByOwnerId(query.ownerId);
    const visible: RepositoryListItem[] = [];
    for (const repository of repositories) {
      if (repository.lifecycleState === "deleted") {
        continue;
      }
      if (repository.visibility === "public") {
        visible.push(mapRepositoryView(repository, "read"));
        continue;
      }
      if (query.actorAccountId === null) {
        continue;
      }
      const permission =
        await this.authorization.resolveRepositoryPermission({
          actorAccountId: query.actorAccountId,
          repository,
        });
      if (permission !== null) {
        visible.push(mapRepositoryView(repository, permission));
      }
    }
    return visible;
  }
}
