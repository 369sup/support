import type { OrganizationRoleAssignmentReference } from "../../../contracts/organization-role-reference";

export type RevokeOrganizationRoleCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  assignmentId: string;
}>;

export type RevokeOrganizationRoleResult =
  | Readonly<{
      status: "revoked";
      assignment: OrganizationRoleAssignmentReference;
    }>
  | Readonly<{
      status: "permission-denied" | "assignment-not-found";
    }>;

export interface RevokeOrganizationRoleUseCase {
  revokeOrganizationRole(
    command: RevokeOrganizationRoleCommand,
  ): Promise<RevokeOrganizationRoleResult>;
}
