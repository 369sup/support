export type EnterpriseTeamOrganizationReference = Readonly<{
  organizationId: string;
  login: string;
  displayName: string;
}>;

export interface OrganizationReferenceGatewayPort {
  getActiveOrganizationInEnterprise(
    enterpriseSlug: string,
    organizationId: string,
  ): Promise<EnterpriseTeamOrganizationReference | null>;
}
