import type { RepositoryPermission } from "../../../domain/repository-permission";

export interface OrganizationPolicyGatewayPort {
  getBaseRepositoryPermission(
    organizationId: string,
  ): Promise<RepositoryPermission | null>;
}
