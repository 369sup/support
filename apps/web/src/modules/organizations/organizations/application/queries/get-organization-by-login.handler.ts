import type {
  GetOrganizationByLoginQuery,
  GetOrganizationByLoginResult,
  GetOrganizationByLoginUseCase,
} from "../ports/inbound/get-organization-by-login.use-case";
import type { OrganizationQueryRepositoryPort } from "../ports/outbound/organization-query.repository.port";

export class GetOrganizationByLoginHandler
  implements GetOrganizationByLoginUseCase
{
  private readonly organizationQueryRepository: OrganizationQueryRepositoryPort;

  constructor(
    organizationQueryRepository: OrganizationQueryRepositoryPort,
  ) {
    this.organizationQueryRepository = organizationQueryRepository;
  }

  async getOrganizationByLogin(
    query: GetOrganizationByLoginQuery,
  ): Promise<GetOrganizationByLoginResult> {
    const login = query.login.trim();
    const organization =
      login.length === 0
        ? null
        : await this.organizationQueryRepository.findByLogin(login);

    if (organization === null || organization.lifecycleState !== "active") {
      return { status: "organization-not-found" };
    }

    return { status: "found", organization };
  }
}
