import type {
  UpdateEnterpriseTeamCommand,
  UpdateEnterpriseTeamResult,
  UpdateEnterpriseTeamUseCase,
} from "../ports/inbound/update-enterprise-team.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class UpdateEnterpriseTeamHandler
  implements UpdateEnterpriseTeamUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  updateEnterpriseTeam(
    command: UpdateEnterpriseTeamCommand,
  ): Promise<UpdateEnterpriseTeamResult> {
    return this.service.update(command);
  }
}
