import type {
  DeleteEnterpriseTeamCommand,
  DeleteEnterpriseTeamResult,
  DeleteEnterpriseTeamUseCase,
} from "../ports/inbound/delete-enterprise-team.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class DeleteEnterpriseTeamHandler
  implements DeleteEnterpriseTeamUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  deleteEnterpriseTeam(
    command: DeleteEnterpriseTeamCommand,
  ): Promise<DeleteEnterpriseTeamResult> {
    return this.service.delete(command);
  }
}
