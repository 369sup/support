import type {
  EnterpriseTeamMembershipReference,
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
}
