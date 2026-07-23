import type {
  CreateOrganizationTeamCommand,
  CreateOrganizationTeamResult,
  CreateOrganizationTeamUseCase,
} from "../ports/inbound/create-organization-team.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class CreateOrganizationTeamHandler
  implements CreateOrganizationTeamUseCase
{
  constructor(private readonly service: OrganizationTeamService) {}

  createOrganizationTeam(
    command: CreateOrganizationTeamCommand,
  ): Promise<CreateOrganizationTeamResult> {
    return this.service.create(command);
  }
}
