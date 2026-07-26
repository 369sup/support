import type { ActivityFeedRepositoryPort } from "../../../application/ports/outbound/activity-feed.repository.port";
import type { ActivityItem } from "../../../contracts/activity-item";

const developmentActivity: readonly ActivityItem[] = [
  {
    activityId: "activity_comment_1",
    repositoryId: "repository_support",
    actorUsername: "mock",
    kind: "comment-added",
    summary: "commented on issue #1",
    href: "/octocat/support/issues/1",
    occurredAt: "2026-07-24T11:00:00.000Z",
  },
  {
    activityId: "activity_issue_2",
    repositoryId: "repository_support",
    actorUsername: "mock",
    kind: "issue-opened",
    summary: "opened issue #2",
    href: "/octocat/support/issues/2",
    occurredAt: "2026-07-21T09:00:00.000Z",
  },
];

export class InMemoryActivityFeedAdapter
  implements ActivityFeedRepositoryPort
{
  listByRepository(repositoryId: string): Promise<readonly ActivityItem[]> {
    return Promise.resolve(
      developmentActivity.filter((item) => item.repositoryId === repositoryId),
    );
  }
}
