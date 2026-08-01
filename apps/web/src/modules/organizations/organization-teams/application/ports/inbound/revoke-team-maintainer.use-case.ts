import type { TeamMaintainerReference } from "../../../domain/organization-team";

export type RevokeTeamMaintainerCommand = Readonly<{
  actorAccountId: string;
  teamId: string;
  targetAccountId: string;
}>;

export type RevokeTeamMaintainerResult =
  | Readonly<{ status: "revoked"; maintainer: TeamMaintainerReference }>
  | Readonly<{
      status:
        | "team-not-found"
        | "team-maintainer-not-found"
        | "permission-denied";
    }>;

export interface RevokeTeamMaintainerUseCase {
  revokeTeamMaintainer(
    command: RevokeTeamMaintainerCommand,
  ): Promise<RevokeTeamMaintainerResult>;
}
