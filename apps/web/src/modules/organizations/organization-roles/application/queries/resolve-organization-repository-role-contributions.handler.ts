import type {
  ResolveOrganizationRepositoryRoleContributionsQuery,
  ResolveOrganizationRepositoryRoleContributionsResult,
  ResolveOrganizationRepositoryRoleContributionsUseCase,
} from "../ports/inbound/resolve-organization-repository-role-contributions.use-case";
import type { OrganizationRoleService } from "../services/organization-role.service";

export class ResolveOrganizationRepositoryRoleContributionsHandler
  implements ResolveOrganizationRepositoryRoleContributionsUseCase
{
  constructor(private readonly service: OrganizationRoleService) {}

  resolveOrganizationRepositoryRoleContributions(
    query: ResolveOrganizationRepositoryRoleContributionsQuery,
  ): Promise<ResolveOrganizationRepositoryRoleContributionsResult> {
    return this.service.resolveContributions(query);
  }
}
