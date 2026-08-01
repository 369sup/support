import type {
  AssignTeamMaintainerCommand,
  AssignTeamMaintainerResult,
  AssignTeamMaintainerUseCase,
} from "../ports/inbound/assign-team-maintainer.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class AssignTeamMaintainerHandler
  implements AssignTeamMaintainerUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  assignTeamMaintainer(
    command: AssignTeamMaintainerCommand,
  ): Promise<AssignTeamMaintainerResult> {
    return this.service.assignMaintainer(command);
  }
}
