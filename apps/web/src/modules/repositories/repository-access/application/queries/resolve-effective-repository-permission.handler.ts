import type {
  ResolveEffectiveRepositoryPermissionQuery,
  ResolveEffectiveRepositoryPermissionResult,
  ResolveEffectiveRepositoryPermissionUseCase,
} from "../ports/inbound/resolve-effective-repository-permission.use-case";
import type { OrganizationMembershipGatewayPort } from "../ports/outbound/organization-membership.gateway.port";
import type { OrganizationRoleGatewayPort } from "../ports/outbound/organization-role.gateway.port";
import type { OrganizationTeamGatewayPort } from "../ports/outbound/organization-team.gateway.port";
import type { RepositoryGrantRepositoryPort } from "../ports/outbound/repository-grant.repository.port";
import type { TeamRepositoryGrantRepositoryPort } from "../ports/outbound/team-repository-grant.repository.port";
import type { RepositoryPermission } from "../../domain/repository-permission";
import { compareRepositoryPermission } from "../../domain/repository-permission-lattice";

export class ResolveEffectiveRepositoryPermissionHandler
  implements ResolveEffectiveRepositoryPermissionUseCase
{
  private readonly grantRepository: RepositoryGrantRepositoryPort;
  private readonly membershipGateway: OrganizationMembershipGatewayPort;
  private readonly teamGrantRepository: TeamRepositoryGrantRepositoryPort;
  private readonly teamGateway: OrganizationTeamGatewayPort;
  private readonly roleGateway: OrganizationRoleGatewayPort;

  constructor(
    grantRepository: RepositoryGrantRepositoryPort,
    membershipGateway: OrganizationMembershipGatewayPort,
    teamGrantRepository: TeamRepositoryGrantRepositoryPort,
    teamGateway: OrganizationTeamGatewayPort,
    roleGateway: OrganizationRoleGatewayPort,
  ) {
    this.grantRepository = grantRepository;
    this.membershipGateway = membershipGateway;
    this.teamGrantRepository = teamGrantRepository;
    this.teamGateway = teamGateway;
    this.roleGateway = roleGateway;
  }

  async resolveEffectiveRepositoryPermission(
    query: ResolveEffectiveRepositoryPermissionQuery,
  ): Promise<ResolveEffectiveRepositoryPermissionResult> {
    const contributions: {
      permission: RepositoryPermission;
      source: ResolveEffectiveRepositoryPermissionResult["sources"][number];
    }[] = [];

    if (query.repository.visibility === "public") {
      contributions.push({
        permission: "read",
        source: { kind: "public-read" },
      });
    }

    if (
      query.repository.owner.kind === "personal" &&
      query.repository.owner.accountId === query.accountId
    ) {
      contributions.push({
        permission: "admin",
        source: { kind: "personal-owner" },
      });
    }

    if (query.repository.owner.kind === "organization") {
      const membership = await this.membershipGateway.getActiveMembership(
        query.accountId,
        query.repository.owner.organizationId,
      );
      if (membership?.role === "owner") {
        contributions.push({
          permission: "admin",
          source: {
            kind: "organization-owner",
            membershipId: membership.membershipId,
          },
        });
      }
    }

    const grants =
      await this.grantRepository.findActiveByRepositoryAndAccount(
        query.repository.repositoryId,
        query.accountId,
      );
    contributions.push(
      ...grants.map((grant) => ({
        permission: grant.permission,
        source: { kind: "direct-grant" as const, grantId: grant.grantId },
      })),
    );

    if (query.repository.owner.kind === "organization") {
      const [teamMemberships, teamGrants, roleContributions] =
        await Promise.all([
          this.teamGateway.listAccountTeamPermissions(
            query.accountId,
            query.repository.owner.organizationId,
          ),
          this.teamGrantRepository.findActiveByRepository(
            query.repository.repositoryId,
          ),
          this.roleGateway.listRepositoryPermissionContributions(
            query.accountId,
            query.repository.owner.organizationId,
          ),
        ]);
      const seenTeamSources = new Set<string>();
      for (const membership of teamMemberships) {
        const eligibleTeamIds = new Set([
          membership.directTeamId,
          ...membership.ancestorTeamIds,
        ]);
        for (const grant of teamGrants) {
          if (
            grant.organizationId !==
              query.repository.owner.organizationId ||
            !eligibleTeamIds.has(grant.teamId)
          ) {
            continue;
          }
          const sourceKey = `${grant.grantId}\u0000${membership.directTeamId}`;
          if (seenTeamSources.has(sourceKey)) {
            continue;
          }
          seenTeamSources.add(sourceKey);
          contributions.push({
            permission: grant.permission,
            source: {
              kind: "team-grant",
              grantId: grant.grantId,
              teamId: grant.teamId,
              matchedTeamId: membership.directTeamId,
              isInherited: grant.teamId !== membership.directTeamId,
            },
          });
        }
      }
      contributions.push(
        ...roleContributions.map((contribution) => ({
          permission: contribution.permission,
          source: {
            kind: "organization-role" as const,
            assignmentId: contribution.assignmentId,
            roleKey: contribution.roleKey,
            subject: contribution.subject,
          },
        })),
      );
    }

    const strongest = contributions.toSorted(
      (left, right) =>
        compareRepositoryPermission(right.permission, left.permission),
    )[0];

    return {
      isAllowed: strongest !== undefined,
      permission: strongest?.permission ?? null,
      sources: contributions.map((contribution) => contribution.source),
    };
  }
}
