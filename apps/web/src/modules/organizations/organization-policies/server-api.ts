import { organizationPoliciesServerFacade } from "./composition/organization-policies.composition";

export type {
  AppAccessPolicyDecision,
  AppAccessRequest,
  BaseRepositoryPermission,
} from "./contracts/app-access-policy-decision";

export const getOrganizationBaseRepositoryPermission =
  organizationPoliciesServerFacade.getOrganizationBaseRepositoryPermission;

export const resolveAppAccessDecision =
  organizationPoliciesServerFacade.resolveAppAccessDecision;
