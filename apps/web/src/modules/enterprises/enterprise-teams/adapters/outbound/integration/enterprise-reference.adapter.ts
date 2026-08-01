import { getEnterpriseBySlug } from "@/modules/enterprises/enterprises/server-api";
import type { EnterpriseReferenceGatewayPort } from "../../../application/ports/outbound/enterprise-reference.gateway.port";

export class EnterpriseReferenceAdapter
  implements EnterpriseReferenceGatewayPort
{
  async getActiveEnterpriseBySlug(enterpriseSlug: string) {
    const result = await getEnterpriseBySlug(enterpriseSlug);
    return result.status === "found"
      ? {
          enterpriseId: result.enterprise.enterpriseId,
          slug: result.enterprise.slug,
        }
      : null;
  }
}
