import { InMemoryProjectAdapter } from "../adapters/outbound/persistence/in-memory-project.adapter";
import { UpdateProjectItemStatusHandler } from "../application/commands/update-project-item-status.handler";
import { ListAccountProjectsHandler } from "../application/queries/list-account-projects.handler";
import { ListRepositoryProjectsHandler } from "../application/queries/list-repository-projects.handler";

const repository = new InMemoryProjectAdapter();
const accountHandler = new ListAccountProjectsHandler(repository);
const repositoryHandler = new ListRepositoryProjectsHandler(repository);
const updateHandler = new UpdateProjectItemStatusHandler(repository);

export const projectsServerFacade = {
  listAccountProjects:
    accountHandler.listAccountProjects.bind(accountHandler),
  listRepositoryProjects:
    repositoryHandler.listRepositoryProjects.bind(repositoryHandler),
  updateProjectItemStatus:
    updateHandler.updateProjectItemStatus.bind(updateHandler),
};
