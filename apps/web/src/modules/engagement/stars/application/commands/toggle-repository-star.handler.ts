import type {
  ToggleRepositoryStarCommand,
  ToggleRepositoryStarResult,
  ToggleRepositoryStarUseCase,
} from "../ports/inbound/toggle-repository-star.use-case";
import type { RepositoryStarRepositoryPort } from "../ports/outbound/repository-star.repository.port";

export class ToggleRepositoryStarHandler
  implements ToggleRepositoryStarUseCase
{
  private readonly stars: RepositoryStarRepositoryPort;

  constructor(stars: RepositoryStarRepositoryPort) {
    this.stars = stars;
  }

  async toggleRepositoryStar(
    command: ToggleRepositoryStarCommand,
  ): Promise<ToggleRepositoryStarResult> {
    if (
      command.repositoryId.trim().length === 0 ||
      command.actorAccountId.trim().length === 0 ||
      command.actorUsername.trim().length === 0
    ) {
      return { status: "invalid-star" };
    }
    const current = await this.stars.find(
      command.repositoryId,
      command.actorAccountId,
    );
    if (current === null) {
      await this.stars.insert(command.repositoryId, {
        accountId: command.actorAccountId,
        username: command.actorUsername,
        starredAt: command.changedAt,
      });
      return { status: "updated", isStarred: true };
    }
    await this.stars.remove(command.repositoryId, command.actorAccountId);
    return { status: "updated", isStarred: false };
  }
}
