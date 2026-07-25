import type { AppAccessPolicyDecision, AppAccessRequest } from "../contracts/app-access-policy-decision";
import { InMemoryOrganizationAppAccessPolicyQueryAdapter } from "../adapters/outbound/persistence/in-memory-organization-app-access-policy-query.adapter";
import { ResolveAppAccessDecisionHandler } from "../application/queries/resolve-app-access-decision.handler";

export interface OrganizationPoliciesServerFacade {
  resolveAppAccessDecision: (
    input: AppAccessRequest,
  ) => Promise<AppAccessPolicyDecision>;
}

function composeOrganizationPoliciesServerFacade(): OrganizationPoliciesServerFacade {
  const policyRepository = new InMemoryOrganizationAppAccessPolicyQueryAdapter(
    InMemoryOrganizationAppAccessPolicyQueryAdapter.createState(),
  );
  const handler = new ResolveAppAccessDecisionHandler(policyRepository);

  return {
    resolveAppAccessDecision: (input) =>
      handler.resolveAppAccessDecision(input),
  };
}

export const organizationPoliciesServerFacade =
  composeOrganizationPoliciesServerFacade();
