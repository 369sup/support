import type { EnterpriseTeamMemberView } from "../../../domain/enterprise-team";

export type ListEnterpriseTeamMembersQuery = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
}>;

export type ListEnterpriseTeamMembersResult =
  | Readonly<{
      status: "found";
      members: readonly EnterpriseTeamMemberView[];
    }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface ListEnterpriseTeamMembersUseCase {
  listEnterpriseTeamMembers(
    query: ListEnterpriseTeamMembersQuery,
  ): Promise<ListEnterpriseTeamMembersResult>;
}
