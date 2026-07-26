import { enterpriseTeamsServerFacade } from "./composition/enterprise-teams.composition";

export type {
  EnterpriseTeamMemberAccount,
  EnterpriseTeamMembershipReference,
  EnterpriseTeamMemberView,
  EnterpriseTeamReference,
} from "./contracts/enterprise-team-reference";

export const addEnterpriseTeamMember =
  enterpriseTeamsServerFacade.addEnterpriseTeamMember;
export const createEnterpriseTeam =
  enterpriseTeamsServerFacade.createEnterpriseTeam;
export const deleteEnterpriseTeam =
  enterpriseTeamsServerFacade.deleteEnterpriseTeam;
export const listEnterpriseTeamMembers =
  enterpriseTeamsServerFacade.listEnterpriseTeamMembers;
export const listEnterpriseTeams =
  enterpriseTeamsServerFacade.listEnterpriseTeams;
export const removeEnterpriseTeamMember =
  enterpriseTeamsServerFacade.removeEnterpriseTeamMember;
export const updateEnterpriseTeam =
  enterpriseTeamsServerFacade.updateEnterpriseTeam;
