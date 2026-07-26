import { AccountReferenceAdapter } from "../adapters/outbound/integration/account-reference.adapter";
import { EnterpriseAdministrationAdapter } from "../adapters/outbound/integration/enterprise-administration.adapter";
import { EnterpriseReferenceAdapter } from "../adapters/outbound/integration/enterprise-reference.adapter";
import { InMemoryEnterpriseTeamAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-team.adapter";
import { InMemoryEnterpriseTeamIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-team-id-generator.adapter";
import { AddEnterpriseTeamMemberHandler } from "../application/commands/add-enterprise-team-member.handler";
import { CreateEnterpriseTeamHandler } from "../application/commands/create-enterprise-team.handler";
import { DeleteEnterpriseTeamHandler } from "../application/commands/delete-enterprise-team.handler";
import { RemoveEnterpriseTeamMemberHandler } from "../application/commands/remove-enterprise-team-member.handler";
import { UpdateEnterpriseTeamHandler } from "../application/commands/update-enterprise-team.handler";
import type { AddEnterpriseTeamMemberUseCase } from "../application/ports/inbound/add-enterprise-team-member.use-case";
import type { CreateEnterpriseTeamUseCase } from "../application/ports/inbound/create-enterprise-team.use-case";
import type { DeleteEnterpriseTeamUseCase } from "../application/ports/inbound/delete-enterprise-team.use-case";
import type { ListEnterpriseTeamMembersUseCase } from "../application/ports/inbound/list-enterprise-team-members.use-case";
import type { ListEnterpriseTeamsUseCase } from "../application/ports/inbound/list-enterprise-teams.use-case";
import type { RemoveEnterpriseTeamMemberUseCase } from "../application/ports/inbound/remove-enterprise-team-member.use-case";
import type { UpdateEnterpriseTeamUseCase } from "../application/ports/inbound/update-enterprise-team.use-case";
import { ListEnterpriseTeamMembersHandler } from "../application/queries/list-enterprise-team-members.handler";
import { ListEnterpriseTeamsHandler } from "../application/queries/list-enterprise-teams.handler";
import { EnterpriseTeamService } from "../application/services/enterprise-team.service";

export interface EnterpriseTeamsServerFacade {
  addEnterpriseTeamMember: AddEnterpriseTeamMemberUseCase["addEnterpriseTeamMember"];
  createEnterpriseTeam: CreateEnterpriseTeamUseCase["createEnterpriseTeam"];
  deleteEnterpriseTeam: DeleteEnterpriseTeamUseCase["deleteEnterpriseTeam"];
  listEnterpriseTeamMembers: ListEnterpriseTeamMembersUseCase["listEnterpriseTeamMembers"];
  listEnterpriseTeams: ListEnterpriseTeamsUseCase["listEnterpriseTeams"];
  removeEnterpriseTeamMember: RemoveEnterpriseTeamMemberUseCase["removeEnterpriseTeamMember"];
  updateEnterpriseTeam: UpdateEnterpriseTeamUseCase["updateEnterpriseTeam"];
}

function composeEnterpriseTeamsServerFacade(): EnterpriseTeamsServerFacade {
  const service = new EnterpriseTeamService(
    new InMemoryEnterpriseTeamAdapter(),
    new EnterpriseReferenceAdapter(),
    new EnterpriseAdministrationAdapter(),
    new AccountReferenceAdapter(),
    new InMemoryEnterpriseTeamIdGeneratorAdapter(),
  );
  const addMember = new AddEnterpriseTeamMemberHandler(service);
  const create = new CreateEnterpriseTeamHandler(service);
  const remove = new DeleteEnterpriseTeamHandler(service);
  const listMembers = new ListEnterpriseTeamMembersHandler(service);
  const list = new ListEnterpriseTeamsHandler(service);
  const removeMember = new RemoveEnterpriseTeamMemberHandler(service);
  const update = new UpdateEnterpriseTeamHandler(service);

  return {
    addEnterpriseTeamMember: (command) =>
      addMember.addEnterpriseTeamMember(command),
    createEnterpriseTeam: (command) =>
      create.createEnterpriseTeam(command),
    deleteEnterpriseTeam: (command) =>
      remove.deleteEnterpriseTeam(command),
    listEnterpriseTeamMembers: (query) =>
      listMembers.listEnterpriseTeamMembers(query),
    listEnterpriseTeams: (query) =>
      list.listEnterpriseTeams(query),
    removeEnterpriseTeamMember: (command) =>
      removeMember.removeEnterpriseTeamMember(command),
    updateEnterpriseTeam: (command) =>
      update.updateEnterpriseTeam(command),
  };
}

export const enterpriseTeamsServerFacade =
  composeEnterpriseTeamsServerFacade();
