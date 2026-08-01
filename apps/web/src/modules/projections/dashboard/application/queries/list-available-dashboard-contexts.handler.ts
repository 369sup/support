import type {
  ListAvailableDashboardContextsQuery,
  ListAvailableDashboardContextsUseCase,
} from "../ports/inbound/list-available-dashboard-contexts.use-case";
import type { DashboardSourceGatewayPort } from "../ports/outbound/dashboard-source.gateway.port";
import type { DashboardContextSnapshot } from "../dashboard-snapshot";

export class ListAvailableDashboardContextsHandler
  implements ListAvailableDashboardContextsUseCase
{
  private readonly sourceGateway: DashboardSourceGatewayPort;

  constructor(sourceGateway: DashboardSourceGatewayPort) {
    this.sourceGateway = sourceGateway;
  }

  async listAvailableDashboardContexts(
    query: ListAvailableDashboardContextsQuery,
  ): Promise<readonly DashboardContextSnapshot[]> {
    const contexts: DashboardContextSnapshot[] = [
      {
        kind: "personal",
        accountId: query.actor.account.accountId,
        login: query.actor.account.username,
        displayName: query.actor.account.displayName,
      },
    ];
    const memberships =
      await this.sourceGateway.listActiveOrganizationMemberships(
        query.actor.account.accountId,
      );
    for (const membership of memberships) {
      const organization = await this.sourceGateway.getOrganization(
        membership.organizationId,
      );
      if (organization?.lifecycleState === "active") {
        contexts.push({
          kind: "organization",
          organizationId: organization.organizationId,
          login: organization.login,
          displayName: organization.displayName,
          relationship: membership.role,
        });
      }
    }
    return contexts;
  }
}
