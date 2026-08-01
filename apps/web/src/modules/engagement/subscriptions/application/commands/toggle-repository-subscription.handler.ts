import type {
  ToggleRepositorySubscriptionCommand,
  ToggleRepositorySubscriptionResult,
  ToggleRepositorySubscriptionUseCase,
} from "../ports/inbound/toggle-repository-subscription.use-case";
import type { RepositorySubscriptionRepositoryPort } from "../ports/outbound/repository-subscription.repository.port";

export class ToggleRepositorySubscriptionHandler
  implements ToggleRepositorySubscriptionUseCase
{
  private readonly subscriptions: RepositorySubscriptionRepositoryPort;

  constructor(subscriptions: RepositorySubscriptionRepositoryPort) {
    this.subscriptions = subscriptions;
  }

  async toggleRepositorySubscription(
    command: ToggleRepositorySubscriptionCommand,
  ): Promise<ToggleRepositorySubscriptionResult> {
    if (
      command.repositoryId.trim().length === 0 ||
      command.actorAccountId.trim().length === 0 ||
      command.actorUsername.trim().length === 0
    ) {
      return { status: "invalid-subscription" };
    }

    const current = await this.subscriptions.find(
      command.repositoryId,
      command.actorAccountId,
    );
    if (current === null) {
      await this.subscriptions.insert(command.repositoryId, {
        accountId: command.actorAccountId,
        username: command.actorUsername,
        subscribedAt: command.changedAt,
      });
      return { status: "updated", isSubscribed: true };
    }
    await this.subscriptions.remove(
      command.repositoryId,
      command.actorAccountId,
    );
    return { status: "updated", isSubscribed: false };
  }
}
