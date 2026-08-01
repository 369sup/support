import type { AppAccessPolicyDecision, AppAccessRequest } from "../contracts/app-access-policy-decision";
import { PostgresOrganizationPolicyQueryAdapter } from "../adapters/outbound/persistence/postgres-organization-policy-query.adapter";
import type { GetOrganizationBaseRepositoryPermissionUseCase } from "../application/ports/inbound/get-organization-base-repository-permission.use-case";
import { GetOrganizationBaseRepositoryPermissionHandler } from "../application/queries/get-organization-base-repository-permission.handler";
import { ResolveAppAccessDecisionHandler } from "../application/queries/resolve-app-access-decision.handler";
import { getProductionDatabase } from "../../../../../production-runtime";

export interface OrganizationPoliciesServerFacade {
  getOrganizationBaseRepositoryPermission: GetOrganizationBaseRepositoryPermissionUseCase["getOrganizationBaseRepositoryPermission"];
  resolveAppAccessDecision: (
    input: AppAccessRequest,
  ) => Promise<AppAccessPolicyDecision>;
}

function composeOrganizationPoliciesServerFacade(): OrganizationPoliciesServerFacade {
  const database = getProductionDatabase();
  const policyRepository = new PostgresOrganizationPolicyQueryAdapter(database);
  const basePermission =
    new GetOrganizationBaseRepositoryPermissionHandler(policyRepository);
  const handler = new ResolveAppAccessDecisionHandler(policyRepository);

  return {
    getOrganizationBaseRepositoryPermission: (query) =>
      basePermission.getOrganizationBaseRepositoryPermission(query),
    resolveAppAccessDecision: (input) =>
      handler.resolveAppAccessDecision(input),
  };
}

export const organizationPoliciesServerFacade =
  composeOrganizationPoliciesServerFacade();
