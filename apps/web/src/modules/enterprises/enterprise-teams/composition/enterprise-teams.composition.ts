import { AccountReferenceAdapter } from "../adapters/outbound/integration/account-reference.adapter";
import { EnterpriseAdministrationAdapter } from "../adapters/outbound/integration/enterprise-administration.adapter";
import { EnterpriseReferenceAdapter } from "../adapters/outbound/integration/enterprise-reference.adapter";
import { OrganizationMembershipAdapter } from "../adapters/outbound/integration/organization-membership.adapter";
import { OrganizationPolicyAdapter } from "../adapters/outbound/integration/organization-policy.adapter";
import { OrganizationReferenceAdapter } from "../adapters/outbound/integration/organization-reference.adapter";
import { InMemoryEnterpriseTeamAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-team.adapter";
import { InMemoryEnterpriseTeamIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-team-id-generator.adapter";
import { NodeEnterpriseTeamIdGeneratorAdapter } from "../adapters/outbound/persistence/node-enterprise-team-id-generator.adapter";
import { PostgresEnterpriseTeamAdapter } from "../adapters/outbound/persistence/postgres-enterprise-team.adapter";
import { AddEnterpriseTeamMemberHandler } from "../application/commands/add-enterprise-team-member.handler";
import { AssignEnterpriseTeamToOrganizationHandler } from "../application/commands/assign-enterprise-team-to-organization.handler";
import { CreateEnterpriseTeamHandler } from "../application/commands/create-enterprise-team.handler";
import { DeleteEnterpriseTeamHandler } from "../application/commands/delete-enterprise-team.handler";
import { RemoveEnterpriseTeamMemberHandler } from "../application/commands/remove-enterprise-team-member.handler";
import { UpdateEnterpriseTeamHandler } from "../application/commands/update-enterprise-team.handler";
import { UnassignEnterpriseTeamFromOrganizationHandler } from "../application/commands/unassign-enterprise-team-from-organization.handler";
import type { AddEnterpriseTeamMemberUseCase } from "../application/ports/inbound/add-enterprise-team-member.use-case";
import type { AssignEnterpriseTeamToOrganizationUseCase } from "../application/ports/inbound/assign-enterprise-team-to-organization.use-case";
import type { CreateEnterpriseTeamUseCase } from "../application/ports/inbound/create-enterprise-team.use-case";
import type { DeleteEnterpriseTeamUseCase } from "../application/ports/inbound/delete-enterprise-team.use-case";
import type { ListEnterpriseTeamMembersUseCase } from "../application/ports/inbound/list-enterprise-team-members.use-case";
import type { ListEnterpriseTeamsUseCase } from "../application/ports/inbound/list-enterprise-teams.use-case";
import type { ListEnterpriseTeamOrganizationAssignmentsUseCase } from "../application/ports/inbound/list-enterprise-team-organization-assignments.use-case";
import type { RemoveEnterpriseTeamMemberUseCase } from "../application/ports/inbound/remove-enterprise-team-member.use-case";
import type { UpdateEnterpriseTeamUseCase } from "../application/ports/inbound/update-enterprise-team.use-case";
import type { UnassignEnterpriseTeamFromOrganizationUseCase } from "../application/ports/inbound/unassign-enterprise-team-from-organization.use-case";
import { ListEnterpriseTeamOrganizationAssignmentsHandler } from "../application/queries/list-enterprise-team-organization-assignments.handler";
import { ListEnterpriseTeamMembersHandler } from "../application/queries/list-enterprise-team-members.handler";
import { ListEnterpriseTeamsHandler } from "../application/queries/list-enterprise-teams.handler";
import { EnterpriseTeamService } from "../application/services/enterprise-team.service";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface EnterpriseTeamsServerFacade {
  addEnterpriseTeamMember: AddEnterpriseTeamMemberUseCase["addEnterpriseTeamMember"];
  assignEnterpriseTeamToOrganization: AssignEnterpriseTeamToOrganizationUseCase["assignEnterpriseTeamToOrganization"];
  createEnterpriseTeam: CreateEnterpriseTeamUseCase["createEnterpriseTeam"];
  deleteEnterpriseTeam: DeleteEnterpriseTeamUseCase["deleteEnterpriseTeam"];
  listEnterpriseTeamMembers: ListEnterpriseTeamMembersUseCase["listEnterpriseTeamMembers"];
  listEnterpriseTeamOrganizationAssignments: ListEnterpriseTeamOrganizationAssignmentsUseCase["listEnterpriseTeamOrganizationAssignments"];
  listEnterpriseTeams: ListEnterpriseTeamsUseCase["listEnterpriseTeams"];
  removeEnterpriseTeamMember: RemoveEnterpriseTeamMemberUseCase["removeEnterpriseTeamMember"];
  updateEnterpriseTeam: UpdateEnterpriseTeamUseCase["updateEnterpriseTeam"];
  unassignEnterpriseTeamFromOrganization: UnassignEnterpriseTeamFromOrganizationUseCase["unassignEnterpriseTeamFromOrganization"];
}

function composeEnterpriseTeamsServerFacade(): EnterpriseTeamsServerFacade {
  const database = getProductionDatabase();
  const service = new EnterpriseTeamService(
    database === null
      ? new InMemoryEnterpriseTeamAdapter()
      : new PostgresEnterpriseTeamAdapter(database),
    new EnterpriseReferenceAdapter(),
    new EnterpriseAdministrationAdapter(),
    new AccountReferenceAdapter(),
    new OrganizationReferenceAdapter(),
    new OrganizationMembershipAdapter(),
    new OrganizationPolicyAdapter(),
    database === null
      ? new InMemoryEnterpriseTeamIdGeneratorAdapter()
      : new NodeEnterpriseTeamIdGeneratorAdapter(),
  );
  const addMember = new AddEnterpriseTeamMemberHandler(service);
  const assignOrganization =
    new AssignEnterpriseTeamToOrganizationHandler(service);
  const create = new CreateEnterpriseTeamHandler(service);
  const remove = new DeleteEnterpriseTeamHandler(service);
  const listMembers = new ListEnterpriseTeamMembersHandler(service);
  const listOrganizationAssignments =
    new ListEnterpriseTeamOrganizationAssignmentsHandler(service);
  const list = new ListEnterpriseTeamsHandler(service);
  const removeMember = new RemoveEnterpriseTeamMemberHandler(service);
  const update = new UpdateEnterpriseTeamHandler(service);
  const unassignOrganization =
    new UnassignEnterpriseTeamFromOrganizationHandler(service);

  return {
    addEnterpriseTeamMember: (command) =>
      addMember.addEnterpriseTeamMember(command),
    assignEnterpriseTeamToOrganization: (command) =>
      assignOrganization.assignEnterpriseTeamToOrganization(command),
    createEnterpriseTeam: (command) =>
      create.createEnterpriseTeam(command),
    deleteEnterpriseTeam: (command) =>
      remove.deleteEnterpriseTeam(command),
    listEnterpriseTeamMembers: (query) =>
      listMembers.listEnterpriseTeamMembers(query),
    listEnterpriseTeamOrganizationAssignments: (query) =>
      listOrganizationAssignments.listEnterpriseTeamOrganizationAssignments(
        query,
      ),
    listEnterpriseTeams: (query) =>
      list.listEnterpriseTeams(query),
    removeEnterpriseTeamMember: (command) =>
      removeMember.removeEnterpriseTeamMember(command),
    updateEnterpriseTeam: (command) =>
      update.updateEnterpriseTeam(command),
    unassignEnterpriseTeamFromOrganization: (command) =>
      unassignOrganization.unassignEnterpriseTeamFromOrganization(command),
  };
}

export const enterpriseTeamsServerFacade =
  composeEnterpriseTeamsServerFacade();
