import type {
  OrganizationRoleAssignmentReference,
  OrganizationRoleAssignmentSubject,
  PredefinedOrganizationRoleKey,
} from "../../../domain/organization-role";

export type AssignOrganizationRoleCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  roleKey: PredefinedOrganizationRoleKey;
  subject: OrganizationRoleAssignmentSubject;
}>;

export type AssignOrganizationRoleResult =
  | Readonly<{
      status: "assigned";
      assignment: OrganizationRoleAssignmentReference;
    }>
  | Readonly<{
      status:
        | "permission-denied"
        | "role-not-found"
        | "subject-not-eligible"
        | "assignment-conflict";
    }>;

export interface AssignOrganizationRoleUseCase {
  assignOrganizationRole(
    command: AssignOrganizationRoleCommand,
  ): Promise<AssignOrganizationRoleResult>;
}
