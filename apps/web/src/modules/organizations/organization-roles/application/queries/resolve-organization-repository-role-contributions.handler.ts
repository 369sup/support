import type {
  ResolveOrganizationRepositoryRoleContributionsQuery,
  ResolveOrganizationRepositoryRoleContributionsResult,
  ResolveOrganizationRepositoryRoleContributionsUseCase,
} from "../ports/inbound/resolve-organization-repository-role-contributions.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ResolveOrganizationRepositoryRoleContributionsHandler
  implements ResolveOrganizationRepositoryRoleContributionsUseCase
{
  private readonly service: OrganizationRoleService;

  constructor(service: OrganizationRoleService) {
    this.service = service;
  }

  resolveOrganizationRepositoryRoleContributions(
    query: ResolveOrganizationRepositoryRoleContributionsQuery,
  ): Promise<ResolveOrganizationRepositoryRoleContributionsResult> {
    return this.service.resolveContributions(query);
  }
}
