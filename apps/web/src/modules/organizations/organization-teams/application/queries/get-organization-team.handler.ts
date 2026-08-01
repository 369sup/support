import type {
  GetOrganizationTeamQuery,
  GetOrganizationTeamResult,
  GetOrganizationTeamUseCase,
} from "../ports/inbound/get-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class GetOrganizationTeamHandler implements GetOrganizationTeamUseCase {
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  getOrganizationTeam(
    query: GetOrganizationTeamQuery,
  ): Promise<GetOrganizationTeamResult> {
    return this.service.get(query);
  }
}
