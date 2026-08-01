import type { EnterpriseTeamOrganizationAssignmentView } from "../../../domain/enterprise-team";

export type ListEnterpriseTeamOrganizationAssignmentsQuery = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
}>;

export type ListEnterpriseTeamOrganizationAssignmentsResult =
  | Readonly<{
      status: "found";
      assignments: readonly EnterpriseTeamOrganizationAssignmentView[];
    }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface ListEnterpriseTeamOrganizationAssignmentsUseCase {
  listEnterpriseTeamOrganizationAssignments(
    query: ListEnterpriseTeamOrganizationAssignmentsQuery,
  ): Promise<ListEnterpriseTeamOrganizationAssignmentsResult>;
}
