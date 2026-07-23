import { OrganizationMembershipAdapter } from "../adapters/outbound/integration/organization-membership.adapter";
import { OrganizationTeamAdapter } from "../adapters/outbound/integration/organization-team.adapter";
import { InMemoryOrganizationRoleAssignmentAdapter } from "../adapters/outbound/persistence/in-memory-organization-role-assignment.adapter";
import { InMemoryOrganizationRoleIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-organization-role-id-generator.adapter";
import { AssignOrganizationRoleHandler } from "../application/commands/assign-organization-role.handler";
import { RevokeOrganizationRoleHandler } from "../application/commands/revoke-organization-role.handler";
import type { AssignOrganizationRoleUseCase } from "../application/ports/inbound/assign-organization-role.use-case";
import type { ListOrganizationRoleAssignmentsUseCase } from "../application/ports/inbound/list-organization-role-assignments.use-case";
import type { ListPredefinedOrganizationRolesUseCase } from "../application/ports/inbound/list-predefined-organization-roles.use-case";
import type { ResolveOrganizationRepositoryRoleContributionsUseCase } from "../application/ports/inbound/resolve-organization-repository-role-contributions.use-case";
import type { RevokeOrganizationRoleUseCase } from "../application/ports/inbound/revoke-organization-role.use-case";
import { ListOrganizationRoleAssignmentsHandler } from "../application/queries/list-organization-role-assignments.handler";
import { ListPredefinedOrganizationRolesHandler } from "../application/queries/list-predefined-organization-roles.handler";
import { ResolveOrganizationRepositoryRoleContributionsHandler } from "../application/queries/resolve-organization-repository-role-contributions.handler";
import { OrganizationRoleService } from "../application/services/organization-role.service";

export type OrganizationRolesServerFacade =
  ListPredefinedOrganizationRolesUseCase &
    ListOrganizationRoleAssignmentsUseCase &
    AssignOrganizationRoleUseCase &
    RevokeOrganizationRoleUseCase &
    ResolveOrganizationRepositoryRoleContributionsUseCase;

function composeOrganizationRolesServerFacade(): OrganizationRolesServerFacade {
  const service = new OrganizationRoleService(
    new InMemoryOrganizationRoleAssignmentAdapter(),
    new OrganizationMembershipAdapter(),
    new OrganizationTeamAdapter(),
    new InMemoryOrganizationRoleIdGeneratorAdapter(),
  );
  const listDefinitions =
    new ListPredefinedOrganizationRolesHandler(service);
  const listAssignments =
    new ListOrganizationRoleAssignmentsHandler(service);
  const assign = new AssignOrganizationRoleHandler(service);
  const revoke = new RevokeOrganizationRoleHandler(service);
  const resolve =
    new ResolveOrganizationRepositoryRoleContributionsHandler(service);

  return {
    listPredefinedOrganizationRoles: (query) =>
      listDefinitions.listPredefinedOrganizationRoles(query),
    listOrganizationRoleAssignments: (query) =>
      listAssignments.listOrganizationRoleAssignments(query),
    assignOrganizationRole: (command) =>
      assign.assignOrganizationRole(command),
    revokeOrganizationRole: (command) =>
      revoke.revokeOrganizationRole(command),
    resolveOrganizationRepositoryRoleContributions: (query) =>
      resolve.resolveOrganizationRepositoryRoleContributions(query),
  };
}

export const organizationRolesServerFacade =
  composeOrganizationRolesServerFacade();
