import type {
  AddEnterpriseTeamMemberCommand,
  AddEnterpriseTeamMemberResult,
  AddEnterpriseTeamMemberUseCase,
} from "../ports/inbound/add-enterprise-team-member.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class AddEnterpriseTeamMemberHandler
  implements AddEnterpriseTeamMemberUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  addEnterpriseTeamMember(
    command: AddEnterpriseTeamMemberCommand,
  ): Promise<AddEnterpriseTeamMemberResult> {
    return this.service.addMember(command);
  }
}
