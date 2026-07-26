import { activityFeedServerFacade } from "./composition/activity-feed.composition";

export type { ActivityItem } from "./contracts/activity-item";
export const listRepositoryActivity =
  activityFeedServerFacade.listRepositoryActivity;
