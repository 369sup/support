import type { EnterpriseQuerySnapshot } from "../outbound/enterprise-query.repository.port";
import type { EnterpriseOrganizationSnapshot } from "../outbound/organization-reference.gateway.port";

export type ListEnterpriseOrganizationsQuery = Readonly<{ slug: string }>;
export type ListEnterpriseOrganizationsResult =
  | Readonly<{
      status: "found";
      enterprise: EnterpriseQuerySnapshot;
      organizations: readonly EnterpriseOrganizationSnapshot[];
    }>
  | Readonly<{ status: "enterprise-not-found" }>;

export interface ListEnterpriseOrganizationsUseCase {
  listEnterpriseOrganizations(
    query: ListEnterpriseOrganizationsQuery,
  ): Promise<ListEnterpriseOrganizationsResult>;
}
