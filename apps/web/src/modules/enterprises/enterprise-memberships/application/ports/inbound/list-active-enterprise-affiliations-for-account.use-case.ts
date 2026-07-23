import type { EnterpriseMembershipQuerySnapshot } from "../outbound/enterprise-membership-query.repository.port";

export type ListActiveEnterpriseAffiliationsForAccountQuery = Readonly<{
  accountId: string;
}>;

export interface ListActiveEnterpriseAffiliationsForAccountUseCase {
  listActiveEnterpriseAffiliationsForAccount(
    query: ListActiveEnterpriseAffiliationsForAccountQuery,
  ): Promise<readonly EnterpriseMembershipQuerySnapshot[]>;
}
