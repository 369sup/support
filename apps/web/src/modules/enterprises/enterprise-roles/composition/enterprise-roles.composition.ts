import { EnterpriseAffiliationAdapter } from "../adapters/outbound/integration/enterprise-affiliation.adapter";
import { InMemoryEnterpriseRoleAssignmentAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-role-assignment.adapter";
import { PostgresEnterpriseRoleAssignmentAdapter } from "../adapters/outbound/persistence/postgres-enterprise-role-assignment.adapter";
import { AuthorizeEnterpriseAdministrationHandler } from "../application/queries/authorize-enterprise-administration.handler";
import type { EnterpriseAdministrationDecision } from "../contracts/enterprise-administration-decision";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface EnterpriseRolesServerFacade {
  authorizeEnterpriseAdministration: (input: {
    accountId: string;
    enterpriseId: string;
  }) => Promise<EnterpriseAdministrationDecision>;
}

function composeEnterpriseRolesServerFacade(): EnterpriseRolesServerFacade {
  const database = getProductionDatabase();
  const handler = new AuthorizeEnterpriseAdministrationHandler(
    new EnterpriseAffiliationAdapter(),
    database === null
      ? new InMemoryEnterpriseRoleAssignmentAdapter()
      : new PostgresEnterpriseRoleAssignmentAdapter(database),
  );
  return {
    authorizeEnterpriseAdministration: (input) =>
      handler.authorizeEnterpriseAdministration(input),
  };
}

export const enterpriseRolesServerFacade =
  composeEnterpriseRolesServerFacade();
