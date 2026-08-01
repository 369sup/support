import { enterpriseTeamsServerFacade } from "./composition/enterprise-teams.composition";

export type {
  EnterpriseTeamMemberAccount,
  EnterpriseTeamMembershipReference,
  EnterpriseTeamOrganizationAssignmentView,
  EnterpriseTeamOrganizationGrantReference,
  EnterpriseTeamMemberView,
  EnterpriseTeamReference,
} from "./contracts/enterprise-team-reference";

export const addEnterpriseTeamMember =
  enterpriseTeamsServerFacade.addEnterpriseTeamMember;
export const assignEnterpriseTeamToOrganization =
  enterpriseTeamsServerFacade.assignEnterpriseTeamToOrganization;
export const createEnterpriseTeam =
  enterpriseTeamsServerFacade.createEnterpriseTeam;
export const deleteEnterpriseTeam =
  enterpriseTeamsServerFacade.deleteEnterpriseTeam;
export const listEnterpriseTeamMembers =
  enterpriseTeamsServerFacade.listEnterpriseTeamMembers;
export const listEnterpriseTeamOrganizationAssignments =
  enterpriseTeamsServerFacade.listEnterpriseTeamOrganizationAssignments;
export const listEnterpriseTeams =
  enterpriseTeamsServerFacade.listEnterpriseTeams;
export const removeEnterpriseTeamMember =
  enterpriseTeamsServerFacade.removeEnterpriseTeamMember;
export const updateEnterpriseTeam =
  enterpriseTeamsServerFacade.updateEnterpriseTeam;
export const unassignEnterpriseTeamFromOrganization =
  enterpriseTeamsServerFacade.unassignEnterpriseTeamFromOrganization;
