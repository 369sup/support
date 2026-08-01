import type {
  GetEnterpriseReferenceByIdQuery,
  GetEnterpriseReferenceByIdResult,
  GetEnterpriseReferenceByIdUseCase,
} from "../ports/inbound/get-enterprise-reference-by-id.use-case";
import type { EnterpriseQueryRepositoryPort } from "../ports/outbound/enterprise-query.repository.port";

export class GetEnterpriseReferenceByIdHandler
  implements GetEnterpriseReferenceByIdUseCase
{
  private readonly enterpriseRepository: EnterpriseQueryRepositoryPort;

  constructor(enterpriseRepository: EnterpriseQueryRepositoryPort) {
    this.enterpriseRepository = enterpriseRepository;
  }

  async getEnterpriseReferenceById(
    query: GetEnterpriseReferenceByIdQuery,
  ): Promise<GetEnterpriseReferenceByIdResult> {
    const enterprise = await this.enterpriseRepository.findById(
      query.enterpriseId,
    );

    if (enterprise === null || enterprise.lifecycleState !== "active") {
      return { status: "enterprise-not-found" };
    }

    return { status: "found", enterprise };
  }
}
