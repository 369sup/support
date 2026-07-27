import { synchronizeEnterpriseTeamOrganizationMemberships } from "@/modules/organizations/organization-memberships/server-api";

import type { OrganizationMembershipGatewayPort } from "../../../application/ports/outbound/organization-membership.gateway.port";

export class OrganizationMembershipAdapter
  implements OrganizationMembershipGatewayPort
{
  async synchronizeEnterpriseTeamAssignment(input: {
    assignmentId: string;
    organizationId: string;
    accountIds: readonly string[];
  }) {
    const result =
      await synchronizeEnterpriseTeamOrganizationMemberships(input);
    return result.memberships;
  }
}
