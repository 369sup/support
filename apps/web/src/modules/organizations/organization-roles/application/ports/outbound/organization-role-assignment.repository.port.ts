import type { OrganizationRoleAssignmentReference } from "../../../domain/organization-role";

export interface OrganizationRoleAssignmentRepositoryPort {
  listByOrganization(
    organizationId: string,
  ): Promise<readonly OrganizationRoleAssignmentReference[]>;
  findById(
    assignmentId: string,
  ): Promise<OrganizationRoleAssignmentReference | null>;
  findActiveByOrganizationSubjectAndRole(
    organizationId: string,
    subjectKey: string,
    roleKey: string,
  ): Promise<OrganizationRoleAssignmentReference | null>;
  save(assignment: OrganizationRoleAssignmentReference): Promise<void>;
}
