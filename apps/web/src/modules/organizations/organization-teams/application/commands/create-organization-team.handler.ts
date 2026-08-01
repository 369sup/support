import type {
  CreateOrganizationTeamCommand,
  CreateOrganizationTeamResult,
  CreateOrganizationTeamUseCase,
} from "../ports/inbound/create-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class CreateOrganizationTeamHandler
  implements CreateOrganizationTeamUseCase
{
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  createOrganizationTeam(
    command: CreateOrganizationTeamCommand,
  ): Promise<CreateOrganizationTeamResult> {
    return this.service.create(command);
  }
}
