export interface EnterpriseAffiliationGatewayPort {
  hasActiveAffiliation(
    accountId: string,
    enterpriseId: string,
  ): Promise<boolean>;
}
