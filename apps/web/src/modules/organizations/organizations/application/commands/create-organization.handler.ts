import type {
  CreateOrganizationCommand,
  CreateOrganizationResult,
  CreateOrganizationUseCase,
} from "../ports/inbound/create-organization.use-case";
import type { OrganizationIdGeneratorPort } from "../ports/outbound/organization-id-generator.port";
import type { OrganizationQueryRepositoryPort } from "../ports/outbound/organization-query.repository.port";

const loginPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export class CreateOrganizationHandler implements CreateOrganizationUseCase {
  private readonly repository: OrganizationQueryRepositoryPort;
  private readonly ids: OrganizationIdGeneratorPort;

  constructor(
    repository: OrganizationQueryRepositoryPort,
    ids: OrganizationIdGeneratorPort,
  ) {
    this.repository = repository;
    this.ids = ids;
  }

  async createOrganization(
    command: CreateOrganizationCommand,
  ): Promise<CreateOrganizationResult> {
    const login = command.login.trim();
    const displayName = command.displayName.trim();
    if (!loginPattern.test(login)) {
      return { status: "invalid-login" };
    }
    if (displayName.length < 1 || displayName.length > 100) {
      return { status: "invalid-display-name" };
    }
    if (this.repository.createWithOwner === undefined) {
      return { status: "service-unavailable" };
    }
    const organizationId = this.ids.nextOrganizationId();
    const result = await this.repository.createWithOwner(
      {
        organizationId,
        login,
        displayName,
        lifecycleState: "active",
      },
      command.actorAccountId,
    );
    return result === "conflict"
      ? { status: "login-conflict" }
      : { status: "created", organizationId, login };
  }
}
