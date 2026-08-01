import type {
  AddTeamMemberCommand,
  AddTeamMemberResult,
  AddTeamMemberUseCase,
} from "../ports/inbound/add-team-member.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class AddTeamMemberHandler implements AddTeamMemberUseCase {
  private readonly service: OrganizationTeamService;

  constructor(service: OrganizationTeamService) {
    this.service = service;
  }

  addTeamMember(command: AddTeamMemberCommand): Promise<AddTeamMemberResult> {
    return this.service.addMember(command);
  }
}
