import { getAccountCandidateByUsername } from "@/modules/identity/accounts/server-api";
import type { OrganizationInvitationAccountGatewayPort } from "../../../application/ports/outbound/organization-invitation-account.gateway.port";

export class OrganizationInvitationAccountAdapter
  implements OrganizationInvitationAccountGatewayPort
{
  async getActiveAccountByUsername(username: string) {
    const result = await getAccountCandidateByUsername(username);
    return result.status === "found"
      ? {
          accountId: result.account.accountId,
          username: result.account.username,
          displayName: result.account.displayName,
          accountType: result.account.accountType,
          usage: result.account.usage,
        }
      : null;
  }
}
