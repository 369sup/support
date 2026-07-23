import type { TeamMaintainerReference } from "../../../domain/organization-team";

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
