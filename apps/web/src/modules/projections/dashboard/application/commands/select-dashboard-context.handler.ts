import type {
  SelectDashboardContextCommand,
  SelectDashboardContextResult,
  SelectDashboardContextUseCase,
} from "../ports/inbound/select-dashboard-context.use-case";
import type { DashboardSelectionRepositoryPort } from "../ports/outbound/dashboard-selection.repository.port";
import type { DashboardSourceGatewayPort } from "../ports/outbound/dashboard-source.gateway.port";

export class SelectDashboardContextHandler
  implements SelectDashboardContextUseCase
{
  private readonly selectionRepository: DashboardSelectionRepositoryPort;
  private readonly sourceGateway: DashboardSourceGatewayPort;

  constructor(
    selectionRepository: DashboardSelectionRepositoryPort,
    sourceGateway: DashboardSourceGatewayPort,
  ) {
    this.selectionRepository = selectionRepository;
    this.sourceGateway = sourceGateway;
  }

  async selectDashboardContext(
    command: SelectDashboardContextCommand,
  ): Promise<SelectDashboardContextResult> {
    if (command.target.kind === "personal") {
      if (command.target.id !== command.actor.account.accountId) {
        return { status: "cross-account-context" };
      }
      const context = {
        kind: "personal" as const,
        accountId: command.actor.account.accountId,
        login: command.actor.account.username,
        displayName: command.actor.account.displayName,
      };
      await this.selectionRepository.save(command.actor.sessionId, context);
      return { status: "selected", context };
    }

    const membership =
      await this.sourceGateway.getActiveOrganizationMembership(
        command.actor.account.accountId,
        command.target.id,
      );
    const organization = await this.sourceGateway.getOrganization(
      command.target.id,
    );
    if (
      membership === null ||
      organization === null ||
      organization.lifecycleState !== "active"
    ) {
      return { status: "context-not-available" };
    }
    const context = {
      kind: "organization" as const,
      organizationId: organization.organizationId,
      login: organization.login,
      displayName: organization.displayName,
      relationship: membership.role,
    };
    await this.selectionRepository.save(command.actor.sessionId, context);
    return { status: "selected", context };
  }
}
