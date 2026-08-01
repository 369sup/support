import {
  getAccountCandidateByUsername,
  getAccountReferenceById,
} from "@/modules/identity/accounts/server-api";
import type { AccountReferenceGatewayPort } from "../../../application/ports/outbound/account-reference.gateway.port";

export class AccountReferenceAdapter
  implements AccountReferenceGatewayPort
{
  async getActiveAccountByUsername(username: string) {
    const result = await getAccountCandidateByUsername(username);
    return result.status === "found"
      ? {
          accountId: result.account.accountId,
          username: result.account.username,
          displayName: result.account.displayName,
          accountType: result.account.accountType,
        }
      : null;
  }

  async getActiveAccountById(accountId: string) {
    const result = await getAccountReferenceById(accountId);
    return result.status === "found"
      ? {
          accountId: result.account.accountId,
          username: result.account.username,
          displayName: result.account.displayName,
          accountType: result.account.accountType,
        }
      : null;
  }
}
