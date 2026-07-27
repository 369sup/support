import type {
  SynchronizeEnterpriseTeamOrganizationMembershipsCommand,
  SynchronizeEnterpriseTeamOrganizationMembershipsResult,
  SynchronizeEnterpriseTeamOrganizationMembershipsUseCase,
} from "../ports/inbound/synchronize-enterprise-team-organization-memberships.use-case";
import type { OrganizationMembershipService } from "../services/organization-membership.service";

export class SynchronizeEnterpriseTeamOrganizationMembershipsHandler
  implements SynchronizeEnterpriseTeamOrganizationMembershipsUseCase
{
  private readonly service: OrganizationMembershipService;

  constructor(service: OrganizationMembershipService) {
    this.service = service;
  }

  synchronizeEnterpriseTeamOrganizationMemberships(
    command: SynchronizeEnterpriseTeamOrganizationMembershipsCommand,
  ): Promise<SynchronizeEnterpriseTeamOrganizationMembershipsResult> {
    return this.service.synchronizeEnterpriseTeamOrganizationMemberships(
      command,
    );
  }
}
