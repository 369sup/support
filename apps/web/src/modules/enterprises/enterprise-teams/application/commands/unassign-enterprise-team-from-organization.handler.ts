import type {
  UnassignEnterpriseTeamFromOrganizationCommand,
  UnassignEnterpriseTeamFromOrganizationResult,
  UnassignEnterpriseTeamFromOrganizationUseCase,
} from "../ports/inbound/unassign-enterprise-team-from-organization.use-case";
import type { EnterpriseTeamService } from "../services/enterprise-team.service";

export class UnassignEnterpriseTeamFromOrganizationHandler
  implements UnassignEnterpriseTeamFromOrganizationUseCase
{
  private readonly service: EnterpriseTeamService;

  constructor(service: EnterpriseTeamService) {
    this.service = service;
  }

  unassignEnterpriseTeamFromOrganization(
    command: UnassignEnterpriseTeamFromOrganizationCommand,
  ): Promise<UnassignEnterpriseTeamFromOrganizationResult> {
    return this.service.unassignFromOrganization(command);
  }
}
