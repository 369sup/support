export type EnterpriseTeamBaseRepositoryPermission =
  | "read"
  | "triage"
  | "write"
  | "maintain"
  | "admin";

export interface OrganizationPolicyGatewayPort {
  getBaseRepositoryPermission(
    organizationId: string,
  ): Promise<EnterpriseTeamBaseRepositoryPermission | null>;
}
