import type {
  GetOrganizationReferenceByIdQuery,
  GetOrganizationReferenceByIdResult,
  GetOrganizationReferenceByIdUseCase,
} from "../ports/inbound/get-organization-reference-by-id.use-case";
import type { OrganizationQueryRepositoryPort } from "../ports/outbound/organization-query.repository.port";

export class GetOrganizationReferenceByIdHandler
  implements GetOrganizationReferenceByIdUseCase
{
  private readonly organizationQueryRepository: OrganizationQueryRepositoryPort;

  constructor(
    organizationQueryRepository: OrganizationQueryRepositoryPort,
  ) {
    this.organizationQueryRepository = organizationQueryRepository;
  }

  async getOrganizationReferenceById(
    query: GetOrganizationReferenceByIdQuery,
  ): Promise<GetOrganizationReferenceByIdResult> {
    const organization =
      await this.organizationQueryRepository.findById(query.organizationId);

    if (organization === null || organization.lifecycleState !== "active") {
      return { status: "organization-not-found" };
    }

    return { status: "found", organization };
  }
}
