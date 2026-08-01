import type {
  OrganizationTeamReference,
  TeamMaintainerReference,
  TeamMembershipReference,
} from "../../../domain/organization-team";

export interface OrganizationTeamRepositoryPort {
  findTeamById(teamId: string): Promise<OrganizationTeamReference | null>;
  findTeamByOrganizationAndSlug(
    organizationId: string,
    slug: string,
  ): Promise<OrganizationTeamReference | null>;
  listTeamsByOrganization(
    organizationId: string,
  ): Promise<readonly OrganizationTeamReference[]>;
  listActiveChildren(
    teamId: string,
  ): Promise<readonly OrganizationTeamReference[]>;
  saveTeam(team: OrganizationTeamReference): Promise<void>;
  findActiveMembership(
    teamId: string,
    accountId: string,
  ): Promise<TeamMembershipReference | null>;
  listActiveMembershipsByTeam(
    teamId: string,
  ): Promise<readonly TeamMembershipReference[]>;
  listActiveMembershipsByAccountAndOrganization(
    accountId: string,
    organizationId: string,
  ): Promise<readonly TeamMembershipReference[]>;
  saveMembership(membership: TeamMembershipReference): Promise<void>;
  findActiveMaintainer(
    teamId: string,
    accountId: string,
  ): Promise<TeamMaintainerReference | null>;
  saveMaintainer(maintainer: TeamMaintainerReference): Promise<void>;
}
