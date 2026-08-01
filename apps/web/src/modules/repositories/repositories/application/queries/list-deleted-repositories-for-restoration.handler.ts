import type {
  ListDeletedRepositoriesForRestorationQuery,
  ListDeletedRepositoriesForRestorationResult,
  ListDeletedRepositoriesForRestorationUseCase,
} from "../ports/inbound/list-deleted-repositories-for-restoration.use-case";
import type { RepositoryClockPort } from "../ports/outbound/repository-clock.port";
import type { RepositoryOwnerAuthorizationGatewayPort } from "../ports/outbound/repository-owner-authorization.gateway.port";
import type { RepositoryQueryRepositoryPort } from "../ports/outbound/repository-query.repository.port";
import { mapRepositoryViewOwner } from "../mappers/map-repository-view-owner";

export class ListDeletedRepositoriesForRestorationHandler
  implements ListDeletedRepositoriesForRestorationUseCase
{
  private readonly repository: RepositoryQueryRepositoryPort;
  private readonly ownerAuthorization: RepositoryOwnerAuthorizationGatewayPort;
  private readonly clock: RepositoryClockPort;

  constructor(
    repository: RepositoryQueryRepositoryPort,
    ownerAuthorization: RepositoryOwnerAuthorizationGatewayPort,
    clock: RepositoryClockPort,
  ) {
    this.repository = repository;
    this.ownerAuthorization = ownerAuthorization;
    this.clock = clock;
  }

  async listDeletedRepositoriesForRestoration(
    query: ListDeletedRepositoriesForRestorationQuery,
  ): Promise<ListDeletedRepositoriesForRestorationResult> {
    const owner = await this.ownerAuthorization.authorizeOwner(
      query.actorAccountId,
      query.ownerId,
    );
    if (owner === null) {
      return { status: "permission-denied" };
    }
    const now = this.clock.now().getTime();
    const repositories = await this.repository.findByOwnerId(owner.id);
    return {
      status: "found",
      repositories: repositories.flatMap((repository) => {
        if (
          repository.lifecycleState !== "deleted" ||
          repository.deletedAt === null ||
          repository.restoreUntil === null
        ) {
          return [];
        }
        return [
          {
            repositoryId: repository.repositoryId,
            owner: mapRepositoryViewOwner(repository),
            name: repository.name,
            deletedAt: repository.deletedAt,
            restoreUntil: repository.restoreUntil,
            isRestorable: now <= Date.parse(repository.restoreUntil),
          },
        ];
      }),
    };
  }
}
