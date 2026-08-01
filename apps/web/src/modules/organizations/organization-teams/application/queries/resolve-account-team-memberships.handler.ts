import type {
  ResolveAccountTeamMembershipsQuery,
  ResolveAccountTeamMembershipsResult,
  ResolveAccountTeamMembershipsUseCase,
} from "../ports/inbound/resolve-account-team-memberships.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class ResolveAccountTeamMembershipsHandler
  implements ResolveAccountTeamMembershipsUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  resolveAccountTeamMemberships(
    query: ResolveAccountTeamMembershipsQuery,
  ): Promise<ResolveAccountTeamMembershipsResult> {
    return this.service.resolveMemberships(query);
  }
}
