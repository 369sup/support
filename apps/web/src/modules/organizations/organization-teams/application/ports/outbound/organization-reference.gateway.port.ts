export interface OrganizationReferenceGatewayPort {
  isActiveOrganization(organizationId: string): Promise<boolean>;
}
