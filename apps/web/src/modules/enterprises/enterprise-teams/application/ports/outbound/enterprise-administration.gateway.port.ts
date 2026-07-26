export interface EnterpriseAdministrationGatewayPort {
  canManageEnterpriseTeams(
    actorAccountId: string,
    enterpriseId: string,
  ): Promise<boolean>;
  canViewEnterpriseTeams(
    actorAccountId: string,
    enterpriseId: string,
  ): Promise<boolean>;
}
