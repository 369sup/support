import type {
  ResolveEffectiveRepositoryPermissionQuery,
  ResolveEffectiveRepositoryPermissionResult,
  ResolveEffectiveRepositoryPermissionUseCase,
} from "../ports/inbound/resolve-effective-repository-permission.use-case";
import type { OrganizationMembershipGatewayPort } from "../ports/outbound/organization-membership.gateway.port";
import type { RepositoryGrantRepositoryPort } from "../ports/outbound/repository-grant.repository.port";

const permissionRank = {
  read: 1,
  triage: 2,
  write: 3,
  maintain: 4,
  admin: 5,
} as const;

export class ResolveEffectiveRepositoryPermissionHandler
  implements ResolveEffectiveRepositoryPermissionUseCase
{
  private readonly grantRepository: RepositoryGrantRepositoryPort;
  private readonly membershipGateway: OrganizationMembershipGatewayPort;

  constructor(
    grantRepository: RepositoryGrantRepositoryPort,
    membershipGateway: OrganizationMembershipGatewayPort,
  ) {
    this.grantRepository = grantRepository;
    this.membershipGateway = membershipGateway;
  }

  async resolveEffectiveRepositoryPermission(
    query: ResolveEffectiveRepositoryPermissionQuery,
  ): Promise<ResolveEffectiveRepositoryPermissionResult> {
    const contributions: {
      permission: keyof typeof permissionRank;
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

    const strongest = contributions.toSorted(
      (left, right) =>
        permissionRank[right.permission] - permissionRank[left.permission],
    )[0];

    return {
      allowed: strongest !== undefined,
      permission: strongest?.permission ?? null,
      sources: contributions.map((contribution) => contribution.source),
    };
  }
}
