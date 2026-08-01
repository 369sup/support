import { getVerifiedAccountIdByEmail } from "@/modules/identity/account-emails/server-api";
import {
  getAccountCandidateByUsername,
  getAccountReferenceById,
} from "@/modules/identity/accounts/server-api";
import type { OrganizationInvitationAccountGatewayPort } from "../../../application/ports/outbound/organization-invitation-account.gateway.port";

export class OrganizationInvitationAccountAdapter
  implements OrganizationInvitationAccountGatewayPort
{
  async getActiveAccountByEmail(email: string) {
    const ownership = await getVerifiedAccountIdByEmail({ email });
    if (ownership.status !== "found") {
      return null;
    }
    const result = await getAccountReferenceById(ownership.accountId);
    return result.status === "found" &&
      result.account.lifecycleState === "active"
      ? {
          accountId: result.account.accountId,
          username: result.account.username,
          displayName: result.account.displayName,
          accountType: result.account.accountType,
          usage: result.account.usage,
        }
      : null;
  }

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
