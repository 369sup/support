export type DiscussionCategory = "announcements" | "general" | "q-and-a";
export type DiscussionState = "open" | "closed";

export type RepositoryDiscussion = Readonly<{
  authorAccountId: string;
  authorUsername: string;
  body: string;
  category: DiscussionCategory;
  createdAt: string;
  discussionId: string;
  number: number;
  repositoryId: string;
  state: DiscussionState;
  title: string;
  updatedAt: string;
}>;
