import type { OrganizationRepositoryRoleContribution } from "../../../contracts/organization-role-reference";

export type ResolveOrganizationRepositoryRoleContributionsQuery = Readonly<{
  accountId: string;
  organizationId: string;
}>;

export type ResolveOrganizationRepositoryRoleContributionsResult =
  readonly OrganizationRepositoryRoleContribution[];

export interface ResolveOrganizationRepositoryRoleContributionsUseCase {
  resolveOrganizationRepositoryRoleContributions(
    query: ResolveOrganizationRepositoryRoleContributionsQuery,
  ): Promise<ResolveOrganizationRepositoryRoleContributionsResult>;
}
