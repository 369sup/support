import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import { checkOrganizationContextEligibility } from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";

import type {
  AuthorizedRepositoryOwner,
  RepositoryOwnerAuthorizationGatewayPort,
} from "../../../application/ports/outbound/repository-owner-authorization.gateway.port";

export class RepositoryOwnerAuthorizationAdapter
  implements RepositoryOwnerAuthorizationGatewayPort
{
  async authorizeOwner(
    actorAccountId: string,
    ownerId: string,
  ): Promise<AuthorizedRepositoryOwner | null> {
    const account = await getAccountReferenceById(ownerId);
    if (
      account.status === "found" &&
      account.account.accountId === actorAccountId &&
      account.account.accountType === "personal" &&
      account.account.lifecycleState === "active"
    ) {
      return {
        kind: "personal",
        id: account.account.accountId,
        login: account.account.username,
      };
    }

    const [organization, eligibility] = await Promise.all([
      getOrganizationReferenceById(ownerId),
      checkOrganizationContextEligibility({
        accountId: actorAccountId,
        organizationId: ownerId,
      }),
    ]);
    if (
      organization.status !== "found" ||
      eligibility.status !== "eligible" ||
      eligibility.membership.role !== "owner"
    ) {
      return null;
    }
    return {
      kind: "organization",
      id: organization.organization.organizationId,
      login: organization.organization.login,
    };
  }
}
