import { discussionsServerFacade } from "./composition/discussions.composition";

export type {
  DiscussionCategory,
  DiscussionState,
  RepositoryDiscussion,
} from "./contracts/repository-discussion";
export const createDiscussion = discussionsServerFacade.createDiscussion;
export const getRepositoryDiscussion =
  discussionsServerFacade.getRepositoryDiscussion;
export const listRepositoryDiscussions =
  discussionsServerFacade.listRepositoryDiscussions;
