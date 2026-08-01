import type { TeamMembershipReference } from "../../../domain/organization-team";

export type RemoveTeamMemberCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
  targetAccountId: string;
}>;

export type RemoveTeamMemberResult =
  | Readonly<{ status: "removed"; membership: TeamMembershipReference }>
  | Readonly<{
      status:
        | "team-not-found"
        | "team-member-not-found"
        | "permission-denied";
    }>;

export interface RemoveTeamMemberUseCase {
  removeTeamMember(
    command: RemoveTeamMemberCommand,
  ): Promise<RemoveTeamMemberResult>;
}
