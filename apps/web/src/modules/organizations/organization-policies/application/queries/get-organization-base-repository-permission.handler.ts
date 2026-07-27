import type {
  GetOrganizationBaseRepositoryPermissionQuery,
  GetOrganizationBaseRepositoryPermissionResult,
  GetOrganizationBaseRepositoryPermissionUseCase,
} from "../ports/inbound/get-organization-base-repository-permission.use-case";
import type { OrganizationAppAccessPolicyQueryRepositoryPort } from "../ports/outbound/organization-app-access-policy-query.repository.port";

export class GetOrganizationBaseRepositoryPermissionHandler
  implements GetOrganizationBaseRepositoryPermissionUseCase
{
  private readonly repository: OrganizationAppAccessPolicyQueryRepositoryPort;

  constructor(repository: OrganizationAppAccessPolicyQueryRepositoryPort) {
    this.repository = repository;
  }

  async getOrganizationBaseRepositoryPermission(
    query: GetOrganizationBaseRepositoryPermissionQuery,
  ): Promise<GetOrganizationBaseRepositoryPermissionResult> {
    return {
      status: "found",
      permission: await this.repository.getBaseRepositoryPermission(
        query.organizationId,
      ),
    };
  }
}
