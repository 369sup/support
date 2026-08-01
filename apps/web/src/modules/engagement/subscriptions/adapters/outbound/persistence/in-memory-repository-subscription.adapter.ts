import type { RepositorySubscriptionRepositoryPort } from "../../../application/ports/outbound/repository-subscription.repository.port";
import type { RepositorySubscriber } from "../../../contracts/repository-subscription";

type SubscriptionStore = Map<string, RepositorySubscriber>;

declare global {
  var __supportRepositorySubscriptionStoreV1: SubscriptionStore | undefined;
}

function subscriptionKey(repositoryId: string, accountId: string): string {
  return `${repositoryId}:${accountId}`;
}

function getProcessStore(): SubscriptionStore {
  globalThis.__supportRepositorySubscriptionStoreV1 ??= new Map([
    [
      subscriptionKey("repository_support", "account_octocat"),
      {
        accountId: "account_octocat",
        username: "octocat",
        subscribedAt: "2026-07-20T08:00:00.000Z",
      },
    ],
  ]);
  return globalThis.__supportRepositorySubscriptionStoreV1;
}

export class InMemoryRepositorySubscriptionAdapter
  implements RepositorySubscriptionRepositoryPort
{
  private readonly subscriptions: SubscriptionStore;

  constructor(subscriptions: SubscriptionStore = getProcessStore()) {
    this.subscriptions = subscriptions;
  }

  find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositorySubscriber | null> {
    return Promise.resolve(
      this.subscriptions.get(subscriptionKey(repositoryId, accountId)) ?? null,
    );
  }

  list(repositoryId: string): Promise<readonly RepositorySubscriber[]> {
    return Promise.resolve(
      [...this.subscriptions.entries()]
        .filter(([key]) => key.startsWith(`${repositoryId}:`))
        .map(([, subscriber]) => subscriber),
    );
  }

  insert(
    repositoryId: string,
    subscriber: RepositorySubscriber,
  ): Promise<void> {
    this.subscriptions.set(
      subscriptionKey(repositoryId, subscriber.accountId),
      subscriber,
    );
    return Promise.resolve();
  }

  remove(repositoryId: string, accountId: string): Promise<void> {
    this.subscriptions.delete(subscriptionKey(repositoryId, accountId));
    return Promise.resolve();
  }
}
