import { InMemoryRepositorySubscriptionAdapter } from "../adapters/outbound/persistence/in-memory-repository-subscription.adapter";
import { ToggleRepositorySubscriptionHandler } from "../application/commands/toggle-repository-subscription.handler";
import type { ListRepositorySubscribersUseCase } from "../application/ports/inbound/list-repository-subscribers.use-case";
import type { ToggleRepositorySubscriptionUseCase } from "../application/ports/inbound/toggle-repository-subscription.use-case";
import { ListRepositorySubscribersHandler } from "../application/queries/list-repository-subscribers.handler";

const subscriptions = new InMemoryRepositorySubscriptionAdapter();
const toggleRepositorySubscription =
  new ToggleRepositorySubscriptionHandler(subscriptions);
const listRepositorySubscribers =
  new ListRepositorySubscribersHandler(subscriptions);

export const subscriptionsServerFacade: Readonly<{
  toggleRepositorySubscription:
    ToggleRepositorySubscriptionUseCase["toggleRepositorySubscription"];
  listRepositorySubscribers:
    ListRepositorySubscribersUseCase["listRepositorySubscribers"];
}> = {
  toggleRepositorySubscription:
    toggleRepositorySubscription.toggleRepositorySubscription.bind(
      toggleRepositorySubscription,
    ),
  listRepositorySubscribers:
    listRepositorySubscribers.listRepositorySubscribers.bind(
      listRepositorySubscribers,
    ),
};
