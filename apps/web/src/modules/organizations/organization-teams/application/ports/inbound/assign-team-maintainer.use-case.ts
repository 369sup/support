import type { TeamMaintainerReference } from "../../../contracts/organization-team-reference";

export type AssignTeamMaintainerCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
  targetAccountId: string;
}>;

export type AssignTeamMaintainerResult =
  | Readonly<{ status: "assigned"; maintainer: TeamMaintainerReference }>
  | Readonly<{
      status:
        | "team-not-found"
        | "team-member-not-found"
        | "permission-denied"
        | "already-team-maintainer";
    }>;

export interface AssignTeamMaintainerUseCase {
  assignTeamMaintainer(
    command: AssignTeamMaintainerCommand,
  ): Promise<AssignTeamMaintainerResult>;
}
