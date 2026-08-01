import type { TeamMembershipReference } from "../../../domain/organization-team";

export type AddTeamMemberCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
  targetAccountId: string;
}>;

export type AddTeamMemberResult =
  | Readonly<{ status: "added"; membership: TeamMembershipReference }>
  | Readonly<{
      status:
        | "team-not-found"
        | "membership-inactive"
        | "permission-denied"
        | "already-team-member";
    }>;

export interface AddTeamMemberUseCase {
  addTeamMember(command: AddTeamMemberCommand): Promise<AddTeamMemberResult>;
}
