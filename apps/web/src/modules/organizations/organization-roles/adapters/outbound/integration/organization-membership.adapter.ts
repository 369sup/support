import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";

import type { OrganizationMembershipGatewayPort } from "../../../application/ports/outbound/organization-membership.gateway.port";

export class OrganizationMembershipAdapter
  implements OrganizationMembershipGatewayPort
{
  async getActiveMembership(accountId: string, organizationId: string) {
    const result = await checkOrganizationContextEligibility({
      accountId,
      organizationId,
    });
    return result.status === "eligible"
      ? {
          membershipId: result.membership.membershipId,
          organizationId: result.membership.organizationId,
          accountId: result.membership.accountId,
          role: result.membership.role,
        }
      : null;
  }
}
