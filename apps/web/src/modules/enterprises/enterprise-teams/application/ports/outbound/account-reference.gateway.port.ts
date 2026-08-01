import type { EnterpriseTeamMemberAccount } from "../../../domain/enterprise-team";

export interface AccountReferenceGatewayPort {
  getActiveAccountByUsername(
    username: string,
  ): Promise<EnterpriseTeamMemberAccount | null>;
  getActiveAccountById(
    accountId: string,
  ): Promise<EnterpriseTeamMemberAccount | null>;
}
