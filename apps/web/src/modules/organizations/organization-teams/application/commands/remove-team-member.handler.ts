import type {
  RemoveTeamMemberCommand,
  RemoveTeamMemberResult,
  RemoveTeamMemberUseCase,
} from "../ports/inbound/remove-team-member.use-case";
import type { OrganizationTeamService } from "../services/organization-team.service";

export class RemoveTeamMemberHandler implements RemoveTeamMemberUseCase {
  constructor(private readonly service: OrganizationTeamService) {}

  removeTeamMember(
    command: RemoveTeamMemberCommand,
  ): Promise<RemoveTeamMemberResult> {
    return this.service.removeMember(command);
  }
}
