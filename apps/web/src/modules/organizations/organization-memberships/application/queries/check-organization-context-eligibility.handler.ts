import type {
  CheckOrganizationContextEligibilityQuery,
  CheckOrganizationContextEligibilityResult,
  CheckOrganizationContextEligibilityUseCase,
} from "../ports/inbound/check-organization-context-eligibility.use-case";
import type { OrganizationMembershipQueryRepositoryPort } from "../ports/outbound/organization-membership-query.repository.port";

export class CheckOrganizationContextEligibilityHandler
  implements CheckOrganizationContextEligibilityUseCase
{
  private readonly membershipRepository: OrganizationMembershipQueryRepositoryPort;

  constructor(
    membershipRepository: OrganizationMembershipQueryRepositoryPort,
  ) {
    this.membershipRepository = membershipRepository;
  }

  async checkOrganizationContextEligibility(
    query: CheckOrganizationContextEligibilityQuery,
  ): Promise<CheckOrganizationContextEligibilityResult> {
    const membership =
      await this.membershipRepository.findByAccountAndOrganization(
        query.accountId,
        query.organizationId,
      );

    if (membership === null || membership.state !== "active") {
      return { status: "context-not-available" };
    }

    return { status: "eligible", membership };
  }
}
