import type {
  RestoreLastValidDashboardContextCommand,
  RestoreLastValidDashboardContextResult,
  RestoreLastValidDashboardContextUseCase,
} from "../ports/inbound/restore-last-valid-dashboard-context.use-case";
import type { DashboardSelectionRepositoryPort } from "../ports/outbound/dashboard-selection.repository.port";
import type { DashboardSourceGatewayPort } from "../ports/outbound/dashboard-source.gateway.port";

export class RestoreLastValidDashboardContextHandler
  implements RestoreLastValidDashboardContextUseCase
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

  async restoreLastValidDashboardContext(
    command: RestoreLastValidDashboardContextCommand,
  ): Promise<RestoreLastValidDashboardContextResult> {
    const selected = await this.selectionRepository.findBySessionId(
      command.actor.sessionId,
    );
    if (
      selected?.kind === "personal" &&
      selected.accountId === command.actor.account.accountId
    ) {
      return { status: "restored", context: selected };
    }
    if (selected?.kind === "organization") {
      const membership =
        await this.sourceGateway.getActiveOrganizationMembership(
          command.actor.account.accountId,
          selected.organizationId,
        );
      const organization = await this.sourceGateway.getOrganization(
        selected.organizationId,
      );
      if (
        membership !== null &&
        organization?.lifecycleState === "active"
      ) {
        const context = {
          kind: "organization" as const,
          organizationId: organization.organizationId,
          login: organization.login,
          displayName: organization.displayName,
          relationship: membership.role,
        };
        await this.selectionRepository.save(command.actor.sessionId, context);
        return { status: "restored", context };
      }
    }

    const fallback = {
      kind: "personal" as const,
      accountId: command.actor.account.accountId,
      login: command.actor.account.username,
      displayName: command.actor.account.displayName,
    };
    await this.selectionRepository.save(command.actor.sessionId, fallback);
    return { status: "fallback-selected", context: fallback };
  }
}
