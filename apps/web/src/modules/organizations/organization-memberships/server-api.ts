import { organizationMembershipsServerFacade } from "./composition/organization-memberships.composition";

export type {
  OrganizationContextEligibilityResult,
  OrganizationMembershipReference,
} from "./contracts/organization-membership-reference";

export const checkOrganizationContextEligibility =
  organizationMembershipsServerFacade.checkOrganizationContextEligibility;
export const listActiveOrganizationMembershipsForAccount =
  organizationMembershipsServerFacade.listActiveOrganizationMembershipsForAccount;
