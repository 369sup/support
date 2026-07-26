import type { RepositorySubscriber } from "../../../domain/repository-subscription";

export type ListRepositorySubscribersResult =
  | Readonly<{ status: "found"; subscribers: readonly RepositorySubscriber[] }>
  | Readonly<{ status: "invalid-repository-id" }>;

export interface ListRepositorySubscribersUseCase {
  listRepositorySubscribers(
    repositoryId: string,
  ): Promise<ListRepositorySubscribersResult>;
}
