import { OrganizationMembershipAdapter } from "../adapters/outbound/integration/organization-membership.adapter";
import { OrganizationReferenceAdapter } from "../adapters/outbound/integration/organization-reference.adapter";
import { InMemoryOrganizationTeamAdapter } from "../adapters/outbound/persistence/in-memory-organization-team.adapter";
import { InMemoryTeamIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-team-id-generator.adapter";
import { AddTeamMemberHandler } from "../application/commands/add-team-member.handler";
import { AssignTeamMaintainerHandler } from "../application/commands/assign-team-maintainer.handler";
import { CreateOrganizationTeamHandler } from "../application/commands/create-organization-team.handler";
import { DeleteOrganizationTeamHandler } from "../application/commands/delete-organization-team.handler";
import { RemoveTeamMemberHandler } from "../application/commands/remove-team-member.handler";
import { RevokeTeamMaintainerHandler } from "../application/commands/revoke-team-maintainer.handler";
import { UpdateOrganizationTeamHandler } from "../application/commands/update-organization-team.handler";
import type { AddTeamMemberUseCase } from "../application/ports/inbound/add-team-member.use-case";
import type { AssignTeamMaintainerUseCase } from "../application/ports/inbound/assign-team-maintainer.use-case";
import type { CreateOrganizationTeamUseCase } from "../application/ports/inbound/create-organization-team.use-case";
import type { DeleteOrganizationTeamUseCase } from "../application/ports/inbound/delete-organization-team.use-case";
import type { GetOrganizationTeamUseCase } from "../application/ports/inbound/get-organization-team.use-case";
import type { ListOrganizationTeamsUseCase } from "../application/ports/inbound/list-organization-teams.use-case";
import type { ListTeamMembersUseCase } from "../application/ports/inbound/list-team-members.use-case";
import type { RemoveTeamMemberUseCase } from "../application/ports/inbound/remove-team-member.use-case";
import type { ResolveAccountTeamMembershipsUseCase } from "../application/ports/inbound/resolve-account-team-memberships.use-case";
import type { RevokeTeamMaintainerUseCase } from "../application/ports/inbound/revoke-team-maintainer.use-case";
import type { UpdateOrganizationTeamUseCase } from "../application/ports/inbound/update-organization-team.use-case";
import { GetOrganizationTeamHandler } from "../application/queries/get-organization-team.handler";
import { ListOrganizationTeamsHandler } from "../application/queries/list-organization-teams.handler";
import { ListTeamMembersHandler } from "../application/queries/list-team-members.handler";
import { ResolveAccountTeamMembershipsHandler } from "../application/queries/resolve-account-team-memberships.handler";
import { OrganizationTeamService } from "../application/services/organization-team.service";

export type OrganizationTeamsServerFacade = CreateOrganizationTeamUseCase &
  GetOrganizationTeamUseCase &
  ListOrganizationTeamsUseCase &
  UpdateOrganizationTeamUseCase &
  DeleteOrganizationTeamUseCase &
  AddTeamMemberUseCase &
  RemoveTeamMemberUseCase &
  AssignTeamMaintainerUseCase &
  RevokeTeamMaintainerUseCase &
  ListTeamMembersUseCase &
  ResolveAccountTeamMembershipsUseCase;

function composeOrganizationTeamsServerFacade(): OrganizationTeamsServerFacade {
  const service = new OrganizationTeamService(
    new InMemoryOrganizationTeamAdapter(),
    new OrganizationMembershipAdapter(),
    new OrganizationReferenceAdapter(),
    new InMemoryTeamIdGeneratorAdapter(),
  );
  const create = new CreateOrganizationTeamHandler(service);
  const get = new GetOrganizationTeamHandler(service);
  const list = new ListOrganizationTeamsHandler(service);
  const update = new UpdateOrganizationTeamHandler(service);
  const remove = new DeleteOrganizationTeamHandler(service);
  const addMember = new AddTeamMemberHandler(service);
  const removeMember = new RemoveTeamMemberHandler(service);
  const assignMaintainer = new AssignTeamMaintainerHandler(service);
  const revokeMaintainer = new RevokeTeamMaintainerHandler(service);
  const listMembers = new ListTeamMembersHandler(service);
  const resolveMemberships =
    new ResolveAccountTeamMembershipsHandler(service);

  return {
    createOrganizationTeam: (command) =>
      create.createOrganizationTeam(command),
    getOrganizationTeam: (query) => get.getOrganizationTeam(query),
    listOrganizationTeams: (query) => list.listOrganizationTeams(query),
    updateOrganizationTeam: (command) =>
      update.updateOrganizationTeam(command),
    deleteOrganizationTeam: (command) =>
      remove.deleteOrganizationTeam(command),
    addTeamMember: (command) => addMember.addTeamMember(command),
    removeTeamMember: (command) =>
      removeMember.removeTeamMember(command),
    assignTeamMaintainer: (command) =>
      assignMaintainer.assignTeamMaintainer(command),
    revokeTeamMaintainer: (command) =>
      revokeMaintainer.revokeTeamMaintainer(command),
    listTeamMembers: (query) => listMembers.listTeamMembers(query),
    resolveAccountTeamMemberships: (query) =>
      resolveMemberships.resolveAccountTeamMemberships(query),
  };
}

export const organizationTeamsServerFacade =
  composeOrganizationTeamsServerFacade();
