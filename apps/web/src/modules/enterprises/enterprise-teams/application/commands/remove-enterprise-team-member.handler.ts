import type {
  RemoveEnterpriseTeamMemberCommand,
  RemoveEnterpriseTeamMemberResult,
  RemoveEnterpriseTeamMemberUseCase,
} from "../ports/inbound/remove-enterprise-team-member.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class RemoveEnterpriseTeamMemberHandler
  implements RemoveEnterpriseTeamMemberUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  removeEnterpriseTeamMember(
    command: RemoveEnterpriseTeamMemberCommand,
  ): Promise<RemoveEnterpriseTeamMemberResult> {
    return this.service.removeMember(command);
  }
}
