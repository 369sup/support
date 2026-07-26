import type {
  ListAccountProjectsResult,
  ListAccountProjectsUseCase,
} from "../ports/inbound/list-account-projects.use-case";
import type { ProjectRepositoryPort } from "../ports/outbound/project.repository.port";

export class ListAccountProjectsHandler implements ListAccountProjectsUseCase {
  private readonly projects: ProjectRepositoryPort;

  constructor(projects: ProjectRepositoryPort) {
    this.projects = projects;
  }

  async listAccountProjects(
    accountId: string,
  ): Promise<ListAccountProjectsResult> {
    return {
      projects: await this.projects.listByAccount(accountId),
      status: "found",
    };
  }
}
