import { InMemoryActivityFeedAdapter } from "../adapters/outbound/persistence/in-memory-activity-feed.adapter";
import type { ListRepositoryActivityUseCase } from "../application/ports/inbound/list-repository-activity.use-case";
import { ListRepositoryActivityHandler } from "../application/queries/list-repository-activity.handler";

const listRepositoryActivity = new ListRepositoryActivityHandler(
  new InMemoryActivityFeedAdapter(),
);

export const activityFeedServerFacade: Readonly<{
  listRepositoryActivity:
    ListRepositoryActivityUseCase["listRepositoryActivity"];
}> = {
  listRepositoryActivity:
    listRepositoryActivity.listRepositoryActivity.bind(
      listRepositoryActivity,
    ),
};
