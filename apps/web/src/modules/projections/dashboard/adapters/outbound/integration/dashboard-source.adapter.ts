import {
  checkOrganizationContextEligibility,
  listActiveOrganizationMembershipsForAccount,
} from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";
import { listVisibleRepositoriesForOwner } from "@/modules/repositories/repositories/server-api";

import type {
  DashboardOrganizationMembershipSnapshot,
  DashboardOrganizationSnapshot,
  DashboardRepositoryCandidateSnapshot,
  DashboardSourceGatewayPort,
} from "../../../application/ports/outbound/dashboard-source.gateway.port";

export class DashboardSourceAdapter implements DashboardSourceGatewayPort {
  async getActiveOrganizationMembership(
    accountId: string,
    organizationId: string,
  ): Promise<DashboardOrganizationMembershipSnapshot | null> {
    const result = await checkOrganizationContextEligibility({
      accountId,
      organizationId,
    });
    return result.status === "eligible" ? result.membership : null;
  }

  async getOrganization(
    organizationId: string,
  ): Promise<DashboardOrganizationSnapshot | null> {
    const result = await getOrganizationReferenceById(organizationId);
    return result.status === "found" ? result.organization : null;
  }

  listActiveOrganizationMemberships(
    accountId: string,
  ): Promise<readonly DashboardOrganizationMembershipSnapshot[]> {
    return listActiveOrganizationMembershipsForAccount(accountId);
  }

  async listVisibleRepositories(
    ownerId: string,
    actorAccountId: string,
  ): Promise<readonly DashboardRepositoryCandidateSnapshot[]> {
    const repositories = await listVisibleRepositoriesForOwner({
      actorAccountId,
      ownerId,
    });
    return repositories.map((repository) => ({
      repositoryId: repository.repositoryId,
      ownerLogin: repository.owner.login,
      owner: repository.owner,
      name: repository.name,
      description: repository.description,
      homepage: repository.homepage,
      visibility: repository.visibility,
      lifecycleState: repository.lifecycleState,
      permission: repository.permission,
      updatedAt: repository.updatedAt,
    }));
  }
}
