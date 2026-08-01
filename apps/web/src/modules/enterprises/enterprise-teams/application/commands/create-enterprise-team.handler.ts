import type {
  CreateEnterpriseTeamCommand,
  CreateEnterpriseTeamResult,
  CreateEnterpriseTeamUseCase,
} from "../ports/inbound/create-enterprise-team.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class CreateEnterpriseTeamHandler
  implements CreateEnterpriseTeamUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  createEnterpriseTeam(
    command: CreateEnterpriseTeamCommand,
  ): Promise<CreateEnterpriseTeamResult> {
    return this.service.create(command);
  }
}
