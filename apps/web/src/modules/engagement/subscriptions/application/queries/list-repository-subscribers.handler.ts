import type {
  ListRepositorySubscribersResult,
  ListRepositorySubscribersUseCase,
} from "../ports/inbound/list-repository-subscribers.use-case";
import type { RepositorySubscriptionRepositoryPort } from "../ports/outbound/repository-subscription.repository.port";

export class ListRepositorySubscribersHandler
  implements ListRepositorySubscribersUseCase
{
  private readonly subscriptions: RepositorySubscriptionRepositoryPort;

  constructor(subscriptions: RepositorySubscriptionRepositoryPort) {
    this.subscriptions = subscriptions;
  }

  async listRepositorySubscribers(
    repositoryId: string,
  ): Promise<ListRepositorySubscribersResult> {
    if (repositoryId.trim().length === 0) {
      return { status: "invalid-repository-id" };
    }
    return {
      status: "found",
      subscribers: await this.subscriptions.list(repositoryId),
    };
  }
}
