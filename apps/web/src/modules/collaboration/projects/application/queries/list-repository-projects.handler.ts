import type {
  ListRepositoryProjectsResult,
  ListRepositoryProjectsUseCase,
} from "../ports/inbound/list-repository-projects.use-case";
import type { ProjectRepositoryPort } from "../ports/outbound/project.repository.port";

export class ListRepositoryProjectsHandler
  implements ListRepositoryProjectsUseCase
{
  private readonly projects: ProjectRepositoryPort;

  constructor(projects: ProjectRepositoryPort) {
    this.projects = projects;
  }

  async listRepositoryProjects(
    repositoryId: string,
  ): Promise<ListRepositoryProjectsResult> {
    return {
      projects: await this.projects.listByRepository(repositoryId),
      status: "found",
    };
  }
}
