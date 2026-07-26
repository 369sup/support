import type { EnterpriseTeamReference } from "../../../domain/enterprise-team";

export type ListEnterpriseTeamsQuery = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
}>;

export type ListEnterpriseTeamsResult =
  | Readonly<{
      status: "found";
      teams: readonly EnterpriseTeamReference[];
    }>
  | Readonly<{
      status: "enterprise-not-found" | "permission-denied";
    }>;

export interface ListEnterpriseTeamsUseCase {
  listEnterpriseTeams(
    query: ListEnterpriseTeamsQuery,
  ): Promise<ListEnterpriseTeamsResult>;
}
