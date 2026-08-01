import type {
  AssignEnterpriseTeamToOrganizationCommand,
  AssignEnterpriseTeamToOrganizationResult,
  AssignEnterpriseTeamToOrganizationUseCase,
} from "../ports/inbound/assign-enterprise-team-to-organization.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class AssignEnterpriseTeamToOrganizationHandler
  implements AssignEnterpriseTeamToOrganizationUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  assignEnterpriseTeamToOrganization(
    command: AssignEnterpriseTeamToOrganizationCommand,
  ): Promise<AssignEnterpriseTeamToOrganizationResult> {
    return this.service.assignToOrganization(command);
  }
}
