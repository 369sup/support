import type { EnterpriseTeamReference } from "../../../domain/enterprise-team";

export type CreateEnterpriseTeamCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  name: string;
  description: string;
}>;

export type CreateEnterpriseTeamResult =
  | Readonly<{ status: "created"; team: EnterpriseTeamReference }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "invalid-name"
        | "permission-denied"
        | "team-limit-reached"
        | "team-slug-conflict";
    }>;

export interface CreateEnterpriseTeamUseCase {
  createEnterpriseTeam(
    command: CreateEnterpriseTeamCommand,
  ): Promise<CreateEnterpriseTeamResult>;
}
