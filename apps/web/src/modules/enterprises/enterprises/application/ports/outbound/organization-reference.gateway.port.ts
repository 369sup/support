export type EnterpriseOrganizationSnapshot = Readonly<{
  organizationId: string;
  login: string;
  displayName: string;
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export interface OrganizationReferenceGatewayPort {
  getOrganizationReference(
    organizationId: string,
  ): Promise<EnterpriseOrganizationSnapshot | null>;
}
