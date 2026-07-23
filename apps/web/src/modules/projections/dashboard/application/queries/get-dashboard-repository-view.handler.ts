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
    const candidates =
      await this.sourceGateway.listActiveRepositories(ownerId);
    const repositories: GetDashboardRepositoryViewResult["repositories"][number][] =
      [];

    for (const candidate of candidates) {
      const decision =
        await this.sourceGateway.resolveRepositoryPermission(
          candidate,
          query.actor.account.accountId,
        );
      if (decision.allowed && decision.permission !== null) {
        repositories.push({
          repositoryId: candidate.repositoryId,
          ownerLogin: candidate.ownerLogin,
          name: candidate.name,
          description: candidate.description,
          visibility: candidate.visibility,
          permission: decision.permission,
          updatedAt: candidate.updatedAt,
        });
      }
    }
    return { context: restored.context, repositories };
  }
}
