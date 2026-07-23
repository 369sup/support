import { organizationTeamsServerFacade } from "./composition/organization-teams.composition";

export type {
  EffectiveTeamMembershipReference,
  OrganizationTeamReference,
  TeamMaintainerReference,
  TeamMemberView,
  TeamMembershipReference,
  TeamVisibility,
} from "./contracts/organization-team-reference";

export const createOrganizationTeam =
  organizationTeamsServerFacade.createOrganizationTeam;
export const getOrganizationTeam =
  organizationTeamsServerFacade.getOrganizationTeam;
export const listOrganizationTeams =
  organizationTeamsServerFacade.listOrganizationTeams;
export const updateOrganizationTeam =
  organizationTeamsServerFacade.updateOrganizationTeam;
export const deleteOrganizationTeam =
  organizationTeamsServerFacade.deleteOrganizationTeam;
export const addTeamMember =
  organizationTeamsServerFacade.addTeamMember;
export const removeTeamMember =
  organizationTeamsServerFacade.removeTeamMember;
export const assignTeamMaintainer =
  organizationTeamsServerFacade.assignTeamMaintainer;
export const revokeTeamMaintainer =
  organizationTeamsServerFacade.revokeTeamMaintainer;
export const listTeamMembers =
  organizationTeamsServerFacade.listTeamMembers;
export const resolveAccountTeamMemberships =
  organizationTeamsServerFacade.resolveAccountTeamMemberships;
