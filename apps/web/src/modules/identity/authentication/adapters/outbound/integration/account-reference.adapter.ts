import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";

import type {
  AccountReferenceGatewayPort,
  AuthenticationAccountSnapshot,
} from "../../../application/ports/outbound/account-reference.gateway.port";

export class AccountReferenceAdapter implements AccountReferenceGatewayPort {
  async getAccountReference(
    accountId: string,
  ): Promise<AuthenticationAccountSnapshot | null> {
    const result = await getAccountReferenceById(accountId);
    return result.status === "found" ? result.account : null;
  }
}
