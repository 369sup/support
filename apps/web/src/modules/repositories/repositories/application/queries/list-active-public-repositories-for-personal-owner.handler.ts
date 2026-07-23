import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";
import type {
  ListActivePublicRepositoriesForPersonalOwnerQuery,
  ListActivePublicRepositoriesForPersonalOwnerUseCase,
} from "../ports/inbound/list-active-public-repositories-for-personal-owner.use-case";

export class ListActivePublicRepositoriesForPersonalOwnerHandler
  implements ListActivePublicRepositoriesForPersonalOwnerUseCase
{
  private readonly repositoryQueryRepository: RepositoryQueryRepositoryPort;

  constructor(repositoryQueryRepository: RepositoryQueryRepositoryPort) {
    this.repositoryQueryRepository = repositoryQueryRepository;
  }

  async listActivePublicRepositoriesForPersonalOwner(
    query: ListActivePublicRepositoriesForPersonalOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    const repositories =
      await this.repositoryQueryRepository.findByOwnerId(query.ownerAccountId);

    return repositories.filter(
      (repository) =>
        repository.owner.kind === "personal" &&
        repository.owner.id === query.ownerAccountId &&
        repository.visibility === "public" &&
        repository.lifecycleState === "active",
    );
  }
}
