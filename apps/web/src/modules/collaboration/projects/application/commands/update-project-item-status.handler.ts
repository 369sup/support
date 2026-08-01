import type {
  UpdateProjectItemStatusCommand,
  UpdateProjectItemStatusResult,
  UpdateProjectItemStatusUseCase,
} from "../ports/inbound/update-project-item-status.use-case";
import type { ProjectRepositoryPort } from "../ports/outbound/project.repository.port";

export class UpdateProjectItemStatusHandler
  implements UpdateProjectItemStatusUseCase
{
  private readonly projects: ProjectRepositoryPort;

  constructor(projects: ProjectRepositoryPort) {
    this.projects = projects;
  }

  async updateProjectItemStatus(
    command: UpdateProjectItemStatusCommand,
  ): Promise<UpdateProjectItemStatusResult> {
    const project = await this.projects.find(command.projectId);
    if (project === null) {
      return { status: "project-not-found" };
    }
    if (project.ownerAccountId !== command.actorAccountId) {
      return { status: "forbidden" };
    }
    if (!project.items.some((item) => item.itemId === command.itemId)) {
      return { status: "item-not-found" };
    }
    const updated = {
      ...project,
      items: project.items.map((item) =>
        item.itemId === command.itemId
          ? { ...item, status: command.status }
          : item,
      ),
      updatedAt: command.updatedAt,
    };
    await this.projects.replace(updated);
    return { project: updated, status: "updated" };
  }
}
