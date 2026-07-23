import type {
  GetOrganizationTeamQuery,
  GetOrganizationTeamResult,
  GetOrganizationTeamUseCase,
} from "../ports/inbound/get-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class GetOrganizationTeamHandler implements GetOrganizationTeamUseCase {
  constructor(private readonly service: OrganizationTeamService) {}

  getOrganizationTeam(
    query: GetOrganizationTeamQuery,
  ): Promise<GetOrganizationTeamResult> {
    return this.service.get(query);
  }
}
