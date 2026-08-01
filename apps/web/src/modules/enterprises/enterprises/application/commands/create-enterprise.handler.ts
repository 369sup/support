import type {
  CreateEnterpriseCommand,
  CreateEnterpriseResult,
  CreateEnterpriseUseCase,
} from "../ports/inbound/create-enterprise.use-case";
import type { EnterpriseIdGeneratorPort } from "../ports/outbound/enterprise-id-generator.port";
import type { EnterpriseQueryRepositoryPort } from "../ports/outbound/enterprise-query.repository.port";

const slugPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export class CreateEnterpriseHandler implements CreateEnterpriseUseCase {
  private readonly repository: EnterpriseQueryRepositoryPort;
  private readonly ids: EnterpriseIdGeneratorPort;

  constructor(
    repository: EnterpriseQueryRepositoryPort,
    ids: EnterpriseIdGeneratorPort,
  ) {
    this.repository = repository;
    this.ids = ids;
  }

  async createEnterprise(
    command: CreateEnterpriseCommand,
  ): Promise<CreateEnterpriseResult> {
    const slug = command.slug.trim();
    const displayName = command.displayName.trim();
    if (!slugPattern.test(slug)) {
      return { status: "invalid-slug" };
    }
    if (displayName.length < 1 || displayName.length > 100) {
      return { status: "invalid-display-name" };
    }
    if (this.repository.createWithOwner === undefined) {
      return { status: "service-unavailable" };
    }
    const enterpriseId = this.ids.nextEnterpriseId();
    const result = await this.repository.createWithOwner(
      {
        enterpriseId,
        slug,
        displayName,
        enterpriseType: "standard",
        lifecycleState: "active",
      },
      command.actorAccountId,
    );
    return result === "conflict"
      ? { status: "slug-conflict" }
      : { status: "created", enterpriseId, slug };
  }
}
