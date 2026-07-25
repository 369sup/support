import { InMemoryOrganizationMembershipQueryAdapter } from "../adapters/outbound/persistence/in-memory-organization-membership-query.adapter";
import { CheckOrganizationContextEligibilityHandler } from "../application/queries/check-organization-context-eligibility.handler";
import { ListActiveOrganizationMembershipsForAccountHandler } from "../application/queries/list-active-organization-memberships-for-account.handler";
import { ListActiveOrganizationMembershipsForOrganizationHandler } from "../application/queries/list-active-organization-memberships-for-organization.handler";
import type {
  OrganizationContextEligibilityResult,
  OrganizationMembershipReference,
} from "../contracts/organization-membership-reference";

export interface OrganizationMembershipsServerFacade {
  checkOrganizationContextEligibility: (input: {
    accountId: string;
    organizationId: string;
  }) => Promise<OrganizationContextEligibilityResult>;
  listActiveOrganizationMembershipsForAccount: (
    accountId: string,
  ) => Promise<readonly OrganizationMembershipReference[]>;
  listActiveOrganizationMembershipsForOrganization: (
    organizationId: string,
  ) => Promise<readonly OrganizationMembershipReference[]>;
}

function composeOrganizationMembershipsServerFacade(): OrganizationMembershipsServerFacade {
  const repository = new InMemoryOrganizationMembershipQueryAdapter();
  const checkEligibility =
    new CheckOrganizationContextEligibilityHandler(repository);
  const listActive =
    new ListActiveOrganizationMembershipsForAccountHandler(repository);
  const listByOrganization =
    new ListActiveOrganizationMembershipsForOrganizationHandler(repository);

  return {
    checkOrganizationContextEligibility: (input) =>
      checkEligibility.checkOrganizationContextEligibility(input),
    listActiveOrganizationMembershipsForAccount: (accountId) =>
      listActive.listActiveOrganizationMembershipsForAccount({ accountId }),
    listActiveOrganizationMembershipsForOrganization: (organizationId) =>
      listByOrganization.listActiveOrganizationMembershipsForOrganization({
        organizationId,
      }),
  };
}

export const organizationMembershipsServerFacade =
  composeOrganizationMembershipsServerFacade();
