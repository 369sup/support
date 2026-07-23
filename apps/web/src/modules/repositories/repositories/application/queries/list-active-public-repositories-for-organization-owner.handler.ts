import type {
  ListActivePublicRepositoriesForOrganizationOwnerQuery,
  ListActivePublicRepositoriesForOrganizationOwnerUseCase,
} from "../ports/inbound/list-active-public-repositories-for-organization-owner.use-case";
import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";

export class ListActivePublicRepositoriesForOrganizationOwnerHandler
  implements ListActivePublicRepositoriesForOrganizationOwnerUseCase
{
  private readonly repositoryQueryRepository: RepositoryQueryRepositoryPort;

  constructor(
    repositoryQueryRepository: RepositoryQueryRepositoryPort,
  ) {
    this.repositoryQueryRepository = repositoryQueryRepository;
  }

  async listActivePublicRepositoriesForOrganizationOwner(
    query: ListActivePublicRepositoriesForOrganizationOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    const repositories =
      await this.repositoryQueryRepository.findByOwnerId(
        query.ownerOrganizationId,
      );
    return repositories.filter(
      (repository) =>
        repository.owner.kind === "organization" &&
        repository.visibility === "public" &&
        repository.lifecycleState === "active",
    );
  }
}
