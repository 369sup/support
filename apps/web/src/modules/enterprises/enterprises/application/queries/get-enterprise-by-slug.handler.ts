import type {
  GetEnterpriseBySlugQuery,
  GetEnterpriseBySlugResult,
  GetEnterpriseBySlugUseCase,
} from "../ports/inbound/get-enterprise-by-slug.use-case";
import type { EnterpriseQueryRepositoryPort } from "../ports/outbound/enterprise-query.repository.port";

export class GetEnterpriseBySlugHandler
  implements GetEnterpriseBySlugUseCase
{
  private readonly enterpriseRepository: EnterpriseQueryRepositoryPort;

  constructor(
    enterpriseRepository: EnterpriseQueryRepositoryPort,
  ) {
    this.enterpriseRepository = enterpriseRepository;
  }

  async getEnterpriseBySlug(
    query: GetEnterpriseBySlugQuery,
  ): Promise<GetEnterpriseBySlugResult> {
    const slug = query.slug.trim();
    const enterprise =
      slug.length === 0
        ? null
        : await this.enterpriseRepository.findBySlug(slug);

    if (enterprise === null || enterprise.lifecycleState !== "active") {
      return { status: "enterprise-not-found" };
    }

    return { status: "found", enterprise };
  }
}
