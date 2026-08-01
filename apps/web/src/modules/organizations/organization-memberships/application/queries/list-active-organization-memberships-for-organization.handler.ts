import type {
  ListActiveOrganizationMembershipsForOrganizationQuery,
  ListActiveOrganizationMembershipsForOrganizationUseCase,
} from "../ports/inbound/list-active-organization-memberships-for-organization.use-case";
import type {
  OrganizationMembershipQueryRepositoryPort,
  OrganizationMembershipQuerySnapshot,
} from "../ports/outbound/organization-membership-query.repository.port";

export class ListActiveOrganizationMembershipsForOrganizationHandler
  implements ListActiveOrganizationMembershipsForOrganizationUseCase
{
  private readonly membershipRepository: OrganizationMembershipQueryRepositoryPort;

  constructor(
    membershipRepository: OrganizationMembershipQueryRepositoryPort,
  ) {
    this.membershipRepository = membershipRepository;
  }

  async listActiveOrganizationMembershipsForOrganization(
    query: ListActiveOrganizationMembershipsForOrganizationQuery,
  ): Promise<readonly OrganizationMembershipQuerySnapshot[]> {
    const memberships = await this.membershipRepository.findByOrganizationId(
      query.organizationId,
    );
    return memberships.filter((membership) => membership.state === "active");
  }
}
