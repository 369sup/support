import type {
  ListEnterpriseOrganizationsQuery,
  ListEnterpriseOrganizationsResult,
  ListEnterpriseOrganizationsUseCase,
} from "../ports/inbound/list-enterprise-organizations.use-case";
import type { EnterpriseQueryRepositoryPort } from "../ports/outbound/enterprise-query.repository.port";
import type { OrganizationReferenceGatewayPort } from "../ports/outbound/organization-reference.gateway.port";

export class ListEnterpriseOrganizationsHandler
  implements ListEnterpriseOrganizationsUseCase
{
  private readonly enterpriseRepository: EnterpriseQueryRepositoryPort;
  private readonly organizationGateway: OrganizationReferenceGatewayPort;

  constructor(
    enterpriseRepository: EnterpriseQueryRepositoryPort,
    organizationGateway: OrganizationReferenceGatewayPort,
  ) {
    this.enterpriseRepository = enterpriseRepository;
    this.organizationGateway = organizationGateway;
  }

  async listEnterpriseOrganizations(
    query: ListEnterpriseOrganizationsQuery,
  ): Promise<ListEnterpriseOrganizationsResult> {
    const enterprise = await this.enterpriseRepository.findBySlug(
      query.slug.trim(),
    );

    if (enterprise === null || enterprise.lifecycleState !== "active") {
      return { status: "enterprise-not-found" };
    }

    const organizationIds =
      await this.enterpriseRepository.findOrganizationIds(
        enterprise.enterpriseId,
      );
    const organizations = await Promise.all(
      organizationIds.map((organizationId) =>
        this.organizationGateway.getOrganizationReference(organizationId),
      ),
    );

    return {
      status: "found",
      enterprise,
      organizations: organizations.filter(
        (
          organization,
        ): organization is NonNullable<typeof organization> =>
          organization !== null && organization.lifecycleState === "active",
      ),
    };
  }
}
