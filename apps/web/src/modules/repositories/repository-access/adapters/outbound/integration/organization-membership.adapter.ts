import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";

import type {
  OrganizationMembershipGatewayPort,
  OrganizationOwnerMembershipSnapshot,
} from "../../../application/ports/outbound/organization-membership.gateway.port";

export class OrganizationMembershipAdapter
  implements OrganizationMembershipGatewayPort
{
  async getActiveMembership(
    accountId: string,
    organizationId: string,
  ): Promise<OrganizationOwnerMembershipSnapshot | null> {
    const result = await checkOrganizationContextEligibility({
      accountId,
      organizationId,
    });
    return result.status === "eligible"
      ? {
          membershipId: result.membership.membershipId,
          role: result.membership.role,
        }
      : null;
  }
}
