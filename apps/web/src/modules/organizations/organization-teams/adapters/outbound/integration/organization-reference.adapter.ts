import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";

import type { OrganizationReferenceGatewayPort } from "../../../application/ports/outbound/organization-reference.gateway.port";

export class OrganizationReferenceAdapter
  implements OrganizationReferenceGatewayPort
{
  async isActiveOrganization(organizationId: string) {
    const result = await getOrganizationReferenceById(organizationId);
    return (
      result.status === "found" &&
      result.organization.lifecycleState === "active"
    );
  }
}
