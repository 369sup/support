export type ActivityItem = Readonly<{
  activityId: string;
  actorUsername: string;
  href: string;
  kind: "issue-opened" | "comment-added" | "repository-starred";
  occurredAt: string;
  repositoryId: string;
  summary: string;
}>;
