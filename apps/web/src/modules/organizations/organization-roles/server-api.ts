import { organizationRolesServerFacade } from "./composition/organization-roles.composition";

export type {
  OrganizationPermission,
  OrganizationRepositoryPermission,
  OrganizationRepositoryRoleContribution,
  OrganizationRoleAssignmentReference,
  OrganizationRoleAssignmentSubject,
  PredefinedOrganizationRoleDefinition,
  PredefinedOrganizationRoleKey,
} from "./contracts/organization-role-reference";

export const listPredefinedOrganizationRoles =
  organizationRolesServerFacade.listPredefinedOrganizationRoles;
export const listOrganizationRoleAssignments =
  organizationRolesServerFacade.listOrganizationRoleAssignments;
export const assignOrganizationRole =
  organizationRolesServerFacade.assignOrganizationRole;
export const revokeOrganizationRole =
  organizationRolesServerFacade.revokeOrganizationRole;
export const resolveOrganizationRepositoryRoleContributions =
  organizationRolesServerFacade.resolveOrganizationRepositoryRoleContributions;
