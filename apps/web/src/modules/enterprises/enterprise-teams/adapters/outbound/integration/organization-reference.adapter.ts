import { listEnterpriseOrganizations } from "@/modules/enterprises/enterprises/server-api";

import type {
  EnterpriseTeamOrganizationReference,
  OrganizationReferenceGatewayPort,
} from "../../../application/ports/outbound/organization-reference.gateway.port";

export class OrganizationReferenceAdapter
  implements OrganizationReferenceGatewayPort
{
  async getActiveOrganizationInEnterprise(
    enterpriseSlug: string,
    organizationId: string,
  ): Promise<EnterpriseTeamOrganizationReference | null> {
    const result = await listEnterpriseOrganizations(enterpriseSlug);
    if (result.status !== "found") {
      return null;
    }
    return (
      result.organizations.find(
        (organization) =>
          organization.organizationId === organizationId &&
          organization.lifecycleState === "active",
      ) ?? null
    );
  }
}
