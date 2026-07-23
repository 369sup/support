import { EnterpriseAffiliationAdapter } from "../adapters/outbound/integration/enterprise-affiliation.adapter";
import { InMemoryEnterpriseRoleAssignmentAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-role-assignment.adapter";
import { AuthorizeEnterpriseAdministrationHandler } from "../application/queries/authorize-enterprise-administration.handler";
import type { EnterpriseAdministrationDecision } from "../contracts/enterprise-administration-decision";

export interface EnterpriseRolesServerFacade {
  authorizeEnterpriseAdministration: (input: {
    accountId: string;
    enterpriseId: string;
  }) => Promise<EnterpriseAdministrationDecision>;
}

function composeEnterpriseRolesServerFacade(): EnterpriseRolesServerFacade {
  const handler = new AuthorizeEnterpriseAdministrationHandler(
    new EnterpriseAffiliationAdapter(),
    new InMemoryEnterpriseRoleAssignmentAdapter(),
  );
  return {
    authorizeEnterpriseAdministration: (input) =>
      handler.authorizeEnterpriseAdministration(input),
  };
}

export const enterpriseRolesServerFacade =
  composeEnterpriseRolesServerFacade();
