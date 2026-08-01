import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";

import type {
  EnterpriseOrganizationSnapshot,
  OrganizationReferenceGatewayPort,
} from "../../../application/ports/outbound/organization-reference.gateway.port";

export class OrganizationReferenceAdapter
  implements OrganizationReferenceGatewayPort
{
  async getOrganizationReference(
    organizationId: string,
  ): Promise<EnterpriseOrganizationSnapshot | null> {
    const result = await getOrganizationReferenceById(organizationId);
    return result.status === "found" ? result.organization : null;
  }
}
