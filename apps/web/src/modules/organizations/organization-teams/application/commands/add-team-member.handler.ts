import type {
  AddTeamMemberCommand,
  AddTeamMemberResult,
  AddTeamMemberUseCase,
} from "../ports/inbound/add-team-member.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class AddTeamMemberHandler implements AddTeamMemberUseCase {
  constructor(private readonly service: OrganizationTeamService) {}

  addTeamMember(command: AddTeamMemberCommand): Promise<AddTeamMemberResult> {
    return this.service.addMember(command);
  }
}
