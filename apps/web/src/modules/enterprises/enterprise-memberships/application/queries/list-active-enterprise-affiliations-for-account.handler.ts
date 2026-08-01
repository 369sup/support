import type {
  ListActiveEnterpriseAffiliationsForAccountQuery,
  ListActiveEnterpriseAffiliationsForAccountUseCase,
} from "../ports/inbound/list-active-enterprise-affiliations-for-account.use-case";
import type {
  EnterpriseMembershipQueryRepositoryPort,
  EnterpriseMembershipQuerySnapshot,
} from "../ports/outbound/enterprise-membership-query.repository.port";

export class ListActiveEnterpriseAffiliationsForAccountHandler
  implements ListActiveEnterpriseAffiliationsForAccountUseCase
{
  private readonly membershipRepository: EnterpriseMembershipQueryRepositoryPort;

  constructor(
    membershipRepository: EnterpriseMembershipQueryRepositoryPort,
  ) {
    this.membershipRepository = membershipRepository;
  }

  async listActiveEnterpriseAffiliationsForAccount(
    query: ListActiveEnterpriseAffiliationsForAccountQuery,
  ): Promise<readonly EnterpriseMembershipQuerySnapshot[]> {
    const memberships = await this.membershipRepository.findByAccountId(
      query.accountId,
    );
    return memberships.filter((membership) => membership.state === "active");
  }
}
