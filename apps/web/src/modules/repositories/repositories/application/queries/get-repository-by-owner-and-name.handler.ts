import type {
  GetRepositoryByOwnerAndNameQuery,
  GetRepositoryByOwnerAndNameResult,
  GetRepositoryByOwnerAndNameUseCase,
} from "../ports/inbound/get-repository-by-owner-and-name.use-case";
import type { RepositoryQueryRepositoryPort } from "../ports/outbound/repository-query.repository.port";

export class GetRepositoryByOwnerAndNameHandler
  implements GetRepositoryByOwnerAndNameUseCase
{
  private readonly repositoryQueryRepository: RepositoryQueryRepositoryPort;

  constructor(
    repositoryQueryRepository: RepositoryQueryRepositoryPort,
  ) {
    this.repositoryQueryRepository = repositoryQueryRepository;
  }

  async getRepositoryByOwnerAndName(
    query: GetRepositoryByOwnerAndNameQuery,
  ): Promise<GetRepositoryByOwnerAndNameResult> {
    const repository =
      await this.repositoryQueryRepository.findByOwnerIdAndName(
        query.ownerId,
        query.name.trim(),
      );
    if (repository === null || repository.lifecycleState !== "active") {
      return { status: "repository-not-found" };
    }
    return { status: "found", repository };
  }
}
