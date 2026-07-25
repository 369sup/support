import { organizationPoliciesServerFacade } from "./composition/organization-policies.composition";

export type { AppAccessPolicyDecision, AppAccessRequest } from "./contracts/app-access-policy-decision";

export const resolveAppAccessDecision =
  organizationPoliciesServerFacade.resolveAppAccessDecision;
