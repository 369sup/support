import type {
  EnterpriseTeamMembershipReference,
  EnterpriseTeamOrganizationGrantReference,
  EnterpriseTeamReference,
} from "../../../domain/enterprise-team";

export interface EnterpriseTeamRepositoryPort {
  countActiveTeamsByEnterprise(enterpriseId: string): Promise<number>;
  findTeamById(teamId: string): Promise<EnterpriseTeamReference | null>;
  findTeamByEnterpriseAndSlug(
    enterpriseId: string,
    slug: string,
  ): Promise<EnterpriseTeamReference | null>;
  listActiveTeamsByEnterprise(
    enterpriseId: string,
    limit: number,
  ): Promise<readonly EnterpriseTeamReference[]>;
  saveTeam(team: EnterpriseTeamReference): Promise<void>;
  countActiveMembershipsByTeam(teamId: string): Promise<number>;
  findActiveMembership(
    teamId: string,
    accountId: string,
  ): Promise<EnterpriseTeamMembershipReference | null>;
  listActiveMembershipsByTeam(
    teamId: string,
    limit: number,
  ): Promise<readonly EnterpriseTeamMembershipReference[]>;
  saveMembership(
    membership: EnterpriseTeamMembershipReference,
  ): Promise<void>;
  countActiveOrganizationGrantsByTeam(teamId: string): Promise<number>;
  findActiveOrganizationGrant(
    teamId: string,
    organizationId: string,
  ): Promise<EnterpriseTeamOrganizationGrantReference | null>;
  listActiveOrganizationGrantsByTeam(
    teamId: string,
  ): Promise<readonly EnterpriseTeamOrganizationGrantReference[]>;
  saveOrganizationGrant(
    grant: EnterpriseTeamOrganizationGrantReference,
  ): Promise<void>;
}
