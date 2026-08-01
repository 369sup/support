import { listActiveEnterpriseAffiliationsForAccount } from "@/modules/enterprises/enterprise-memberships/server-api";

import type { EnterpriseAffiliationGatewayPort } from "../../../application/ports/outbound/enterprise-affiliation.gateway.port";

export class EnterpriseAffiliationAdapter
  implements EnterpriseAffiliationGatewayPort
{
  async hasActiveAffiliation(
    accountId: string,
    enterpriseId: string,
  ): Promise<boolean> {
    const affiliations =
      await listActiveEnterpriseAffiliationsForAccount(accountId);
    return affiliations.some(
      (affiliation) => affiliation.enterpriseId === enterpriseId,
    );
  }
}
