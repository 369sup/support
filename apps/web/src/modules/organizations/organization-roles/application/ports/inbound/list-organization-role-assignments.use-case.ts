import type { OrganizationRoleAssignmentReference } from "../../../contracts/organization-role-reference";

export type ListOrganizationRoleAssignmentsQuery = Readonly<{
  actorAccountId: string;
  organizationId: string;
}>;

export type ListOrganizationRoleAssignmentsResult =
  | Readonly<{
      status: "found";
      assignments: readonly OrganizationRoleAssignmentReference[];
    }>
  | Readonly<{ status: "permission-denied" }>;

export interface ListOrganizationRoleAssignmentsUseCase {
  listOrganizationRoleAssignments(
    query: ListOrganizationRoleAssignmentsQuery,
  ): Promise<ListOrganizationRoleAssignmentsResult>;
}
