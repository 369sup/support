export type ToggleRepositorySubscriptionCommand = Readonly<{
  repositoryId: string;
  actorAccountId: string;
  actorUsername: string;
  changedAt: string;
}>;

export type ToggleRepositorySubscriptionResult =
  | Readonly<{ status: "updated"; isSubscribed: boolean }>
  | Readonly<{ status: "invalid-subscription" }>;

export interface ToggleRepositorySubscriptionUseCase {
  toggleRepositorySubscription(
    command: ToggleRepositorySubscriptionCommand,
  ): Promise<ToggleRepositorySubscriptionResult>;
}
