import type {
  ListRepositoryStargazersResult,
  ListRepositoryStargazersUseCase,
} from "../ports/inbound/list-repository-stargazers.use-case";
import type { RepositoryStarRepositoryPort } from "../ports/outbound/repository-star.repository.port";

export class ListRepositoryStargazersHandler
  implements ListRepositoryStargazersUseCase
{
  private readonly stars: RepositoryStarRepositoryPort;

  constructor(stars: RepositoryStarRepositoryPort) {
    this.stars = stars;
  }

  async listRepositoryStargazers(
    repositoryId: string,
  ): Promise<ListRepositoryStargazersResult> {
    if (repositoryId.trim().length === 0) {
      return { status: "invalid-repository-id" };
    }
    return {
      status: "found",
      stargazers: (await this.stars.list(repositoryId)).toSorted((left, right) =>
        right.starredAt.localeCompare(left.starredAt),
      ),
    };
  }
}
