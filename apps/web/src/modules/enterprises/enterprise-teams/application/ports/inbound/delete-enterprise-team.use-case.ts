import type { EnterpriseTeamReference } from "../../../domain/enterprise-team";

export type DeleteEnterpriseTeamCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
}>;

export type DeleteEnterpriseTeamResult =
  | Readonly<{ status: "deleted"; team: EnterpriseTeamReference }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface DeleteEnterpriseTeamUseCase {
  deleteEnterpriseTeam(
    command: DeleteEnterpriseTeamCommand,
  ): Promise<DeleteEnterpriseTeamResult>;
}
