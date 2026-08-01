import type { EnterpriseTeamReference } from "../../../domain/enterprise-team";

export type UpdateEnterpriseTeamCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
  name: string;
  description: string;
}>;

export type UpdateEnterpriseTeamResult =
  | Readonly<{ status: "updated"; team: EnterpriseTeamReference }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "invalid-name"
        | "permission-denied"
        | "team-not-found"
        | "team-slug-conflict";
    }>;

export interface UpdateEnterpriseTeamUseCase {
  updateEnterpriseTeam(
    command: UpdateEnterpriseTeamCommand,
  ): Promise<UpdateEnterpriseTeamResult>;
}
