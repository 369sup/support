import { getOrganizationBaseRepositoryPermission } from "@/modules/organizations/organization-policies/server-api";

import type { OrganizationPolicyGatewayPort } from "../../../application/ports/outbound/organization-policy.gateway.port";

export class OrganizationPolicyAdapter
  implements OrganizationPolicyGatewayPort
{
  async getBaseRepositoryPermission(organizationId: string) {
    const result = await getOrganizationBaseRepositoryPermission({
      organizationId,
    });
    return result.permission;
  }
}
