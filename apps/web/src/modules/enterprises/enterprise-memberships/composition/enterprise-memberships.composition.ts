import { InMemoryEnterpriseMembershipQueryAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-membership-query.adapter";
import { PostgresEnterpriseMembershipQueryAdapter } from "../adapters/outbound/persistence/postgres-enterprise-membership-query.adapter";
import { ListActiveEnterpriseAffiliationsForAccountHandler } from "../application/queries/list-active-enterprise-affiliations-for-account.handler";
import type { EnterpriseAffiliation } from "../contracts/enterprise-affiliation";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface EnterpriseMembershipsServerFacade {
  listActiveEnterpriseAffiliationsForAccount: (
    accountId: string,
  ) => Promise<readonly EnterpriseAffiliation[]>;
}

function composeEnterpriseMembershipsServerFacade(): EnterpriseMembershipsServerFacade {
  const database = getProductionDatabase();
  const repository =
    database === null
      ? new InMemoryEnterpriseMembershipQueryAdapter()
      : new PostgresEnterpriseMembershipQueryAdapter(database);
  const listActive =
    new ListActiveEnterpriseAffiliationsForAccountHandler(repository);
  return {
    listActiveEnterpriseAffiliationsForAccount: (accountId) =>
      listActive.listActiveEnterpriseAffiliationsForAccount({ accountId }),
  };
}

export const enterpriseMembershipsServerFacade =
  composeEnterpriseMembershipsServerFacade();
