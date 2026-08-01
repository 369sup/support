import type { RepositorySubscriber } from "../../../domain/repository-subscription";

export interface RepositorySubscriptionRepositoryPort {
  find(
    repositoryId: string,
    accountId: string,
  ): Promise<RepositorySubscriber | null>;
  list(repositoryId: string): Promise<readonly RepositorySubscriber[]>;
  insert(repositoryId: string, subscriber: RepositorySubscriber): Promise<void>;
  remove(repositoryId: string, accountId: string): Promise<void>;
}
