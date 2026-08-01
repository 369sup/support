import type {
  AttachEnterpriseOrganizationCommand,
  AttachEnterpriseOrganizationResult,
  AttachEnterpriseOrganizationUseCase,
} from "../ports/inbound/attach-enterprise-organization.use-case";
import type { EnterpriseQueryRepositoryPort } from "../ports/outbound/enterprise-query.repository.port";

export class AttachEnterpriseOrganizationHandler
  implements AttachEnterpriseOrganizationUseCase
{
  private readonly repository: EnterpriseQueryRepositoryPort;

  constructor(repository: EnterpriseQueryRepositoryPort) {
    this.repository = repository;
  }

  async attachEnterpriseOrganization(
    command: AttachEnterpriseOrganizationCommand,
  ): Promise<AttachEnterpriseOrganizationResult> {
    if (this.repository.attachOrganization === undefined) {
      return { status: "service-unavailable" };
    }
    return {
      status: await this.repository.attachOrganization(
        command.enterpriseId,
        command.organizationId,
      ),
    };
  }
}
