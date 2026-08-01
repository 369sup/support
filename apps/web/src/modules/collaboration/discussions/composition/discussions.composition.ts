import { getProductionDatabase } from "../../../../../production-runtime";
import { PostgresDiscussionAdapter } from "../adapters/outbound/persistence/postgres-discussion.adapter";
import { CreateDiscussionHandler } from "../application/commands/create-discussion.handler";
import { GetRepositoryDiscussionHandler } from "../application/queries/get-repository-discussion.handler";
import { ListRepositoryDiscussionsHandler } from "../application/queries/list-repository-discussions.handler";

const repository = new PostgresDiscussionAdapter(getProductionDatabase());
const createHandler = new CreateDiscussionHandler(repository);
const getHandler = new GetRepositoryDiscussionHandler(repository);
const listHandler = new ListRepositoryDiscussionsHandler(repository);

export const discussionsServerFacade = {
  createDiscussion: createHandler.createDiscussion.bind(createHandler),
  getRepositoryDiscussion:
    getHandler.getRepositoryDiscussion.bind(getHandler),
  listRepositoryDiscussions:
    listHandler.listRepositoryDiscussions.bind(listHandler),
};
