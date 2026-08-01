import type {
  ListActiveRepositoriesForOwnerQuery,
  ListActiveRepositoriesForOwnerUseCase,
} from "../ports/inbound/list-active-repositories-for-owner.use-case";
import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";

export class ListActiveRepositoriesForOwnerHandler
  implements ListActiveRepositoriesForOwnerUseCase
{
  private readonly repositoryQueryRepository: RepositoryQueryRepositoryPort;

  constructor(
    repositoryQueryRepository: RepositoryQueryRepositoryPort,
  ) {
    this.repositoryQueryRepository = repositoryQueryRepository;
  }

  async listActiveRepositoriesForOwner(
    query: ListActiveRepositoriesForOwnerQuery,
  ): Promise<readonly RepositoryQuerySnapshot[]> {
    const repositories =
      await this.repositoryQueryRepository.findByOwnerId(query.ownerId);
    return repositories.filter(
      (repository) => repository.lifecycleState === "active",
    );
  }
}
