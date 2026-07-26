export type ActivityItem = Readonly<{
  activityId: string;
  repositoryId: string;
  actorUsername: string;
  kind: "issue-opened" | "comment-added" | "repository-starred";
  summary: string;
  href: string;
  occurredAt: string;
}>;
