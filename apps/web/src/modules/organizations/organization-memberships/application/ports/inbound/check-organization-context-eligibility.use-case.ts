import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type CheckOrganizationContextEligibilityQuery = Readonly<{
  accountId: string;
  organizationId: string;
}>;

export type CheckOrganizationContextEligibilityResult =
  | Readonly<{
      status: "eligible";
      membership: OrganizationMembershipQuerySnapshot;
    }>
  | Readonly<{ status: "context-not-available" }>;

export interface CheckOrganizationContextEligibilityUseCase {
  checkOrganizationContextEligibility(
    query: CheckOrganizationContextEligibilityQuery,
  ): Promise<CheckOrganizationContextEligibilityResult>;
}
