import type {
  RepositoryQueryRepositoryPort,
  RepositoryQuerySnapshot,
} from "../ports/outbound/repository-query.repository.port";

export type ListActivePublicRepositoriesForPersonalOwnerQuery = Readonly<{
  ownerAccountId: string;
}>;

export class ListActivePublicRepositoriesForPersonalOwnerHandler {
  private readonly repositoryQueryRepository: RepositoryQueryRepositoryPort;

  constructor(repositoryQueryRepository: RepositoryQueryRepositoryPort) {
    this.repositoryQueryRepository = repositoryQueryRepository;
  }

  async execute(
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
