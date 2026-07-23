import { getAccountReferenceById } from "@/modules/identity/accounts/server-api";
import {
  checkOrganizationContextEligibility,
  listActiveOrganizationMembershipsForAccount,
} from "@/modules/organizations/organization-memberships/server-api";
import { getOrganizationReferenceById } from "@/modules/organizations/organizations/server-api";
import { resolveEffectiveRepositoryPermission } from "@/modules/repositories/repository-access/server-api";
import { listActiveRepositoriesForOwner } from "@/modules/repositories/repositories/server-api";

import type {
  DashboardOrganizationMembershipSnapshot,
  DashboardOrganizationSnapshot,
  DashboardRepositoryCandidateSnapshot,
  DashboardRepositoryPermissionSnapshot,
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

  async listActiveRepositories(
    ownerId: string,
  ): Promise<readonly DashboardRepositoryCandidateSnapshot[]> {
    const repositories = await listActiveRepositoriesForOwner(ownerId);
    return repositories.map((repository) => ({
      repositoryId: repository.repositoryId,
      ownerLogin: repository.owner.login,
      owner: repository.owner,
      name: repository.name,
      description: repository.description,
      visibility: repository.visibility,
      updatedAt: repository.updatedAt,
    }));
  }

  async resolveRepositoryPermission(
    repository: DashboardRepositoryCandidateSnapshot,
    accountId: string,
  ): Promise<DashboardRepositoryPermissionSnapshot> {
    const accountResult = await getAccountReferenceById(accountId);
    if (accountResult.status !== "found") {
      return { allowed: false, permission: null };
    }
    return resolveEffectiveRepositoryPermission({
      repository: {
        ...repository,
        lifecycleState: "active",
      },
      actor: accountResult.account,
    });
  }
}
