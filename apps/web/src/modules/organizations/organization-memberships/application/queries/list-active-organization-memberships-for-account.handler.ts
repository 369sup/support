import type {
  ListActiveOrganizationMembershipsForAccountQuery,
  ListActiveOrganizationMembershipsForAccountUseCase,
} from "../ports/inbound/list-active-organization-memberships-for-account.use-case";
import type {
  OrganizationMembershipQueryRepositoryPort,
  OrganizationMembershipQuerySnapshot,
} from "../ports/outbound/organization-membership-query.repository.port";

export class ListActiveOrganizationMembershipsForAccountHandler
  implements ListActiveOrganizationMembershipsForAccountUseCase
{
  private readonly membershipRepository: OrganizationMembershipQueryRepositoryPort;

  constructor(
    membershipRepository: OrganizationMembershipQueryRepositoryPort,
  ) {
    this.membershipRepository = membershipRepository;
  }

  async listActiveOrganizationMembershipsForAccount(
    query: ListActiveOrganizationMembershipsForAccountQuery,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]> {
    const memberships = await this.membershipRepository.findByAccountId(
      query.accountId,
    );
    return memberships.filter((membership) => membership.state === "active");
  }
}
