import type { RestoreLastValidDashboardContextUseCase } from "../ports/inbound/restore-last-valid-dashboard-context.use-case";
import type {
  GetDashboardRepositoryViewQuery,
  GetDashboardRepositoryViewResult,
  GetDashboardRepositoryViewUseCase,
} from "../ports/inbound/get-dashboard-repository-view.use-case";
import type { DashboardSourceGatewayPort } from "../ports/outbound/dashboard-source.gateway.port";

export class GetDashboardRepositoryViewHandler
  implements GetDashboardRepositoryViewUseCase
{
  private readonly restoreContext: RestoreLastValidDashboardContextUseCase;
  private readonly sourceGateway: DashboardSourceGatewayPort;

  constructor(
    restoreContext: RestoreLastValidDashboardContextUseCase,
    sourceGateway: DashboardSourceGatewayPort,
  ) {
    this.restoreContext = restoreContext;
    this.sourceGateway = sourceGateway;
  }

  async getDashboardRepositoryView(
    query: GetDashboardRepositoryViewQuery,
  ): Promise<GetDashboardRepositoryViewResult> {
    const restored =
      await this.restoreContext.restoreLastValidDashboardContext({
        actor: query.actor,
      });
    const ownerId =
      restored.context.kind === "personal"
        ? restored.context.accountId
        : restored.context.organizationId;
    const repositories =
      await this.sourceGateway.listVisibleRepositories(
        ownerId,
        query.actor.account.accountId,
      );
    return { context: restored.context, repositories };
  }
}
