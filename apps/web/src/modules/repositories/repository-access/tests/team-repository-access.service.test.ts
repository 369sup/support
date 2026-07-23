import { describe, expect, it } from "vitest";

import { InMemoryRepositoryGrantAdapter } from "../adapters/outbound/persistence/in-memory-repository-grant.adapter";
import { InMemoryTeamRepositoryGrantIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-team-repository-grant-id-generator.adapter";
import type { ResolveEffectiveRepositoryPermissionUseCase } from "../application/ports/inbound/resolve-effective-repository-permission.use-case";
import type { OrganizationTeamGatewayPort } from "../application/ports/outbound/organization-team.gateway.port";
import { TeamRepositoryAccessService } from "../application/services/team-repository-access.service";

const repository = {
  repositoryId: "repository",
  owner: {
    kind: "organization" as const,
    organizationId: "organization",
  },
  visibility: "private" as const,
};

function createHarness(input?: {
  admin?: boolean;
  maintainer?: boolean;
  parentGrant?: boolean;
  directGrant?: boolean;
}) {
  const grants = new InMemoryRepositoryGrantAdapter(
    [],
    [
      ...(input?.parentGrant === true
        ? [
            {
              grantId: "parent_grant",
              repositoryId: "repository",
              organizationId: "organization",
              teamId: "parent",
              permission: "read",
              state: "active",
            },
          ] as const
        : []),
      ...(input?.directGrant === true
        ? [
            {
              grantId: "direct_grant",
              repositoryId: "repository",
              organizationId: "organization",
              teamId: "team",
              permission: "read",
              state: "active",
            },
          ] as const
        : []),
    ],
  );
  const teams: OrganizationTeamGatewayPort = {
    listAccountTeamPermissions: () => Promise.resolve([]),
    getTeamForActor: ({ organizationId, teamId }) =>
      Promise.resolve(
        organizationId === "organization" &&
          ["team", "child"].includes(teamId)
          ? {
              teamId,
              organizationId,
              parentTeamId: teamId === "child" ? "parent" : null,
              isMaintainer: input?.maintainer ?? false,
            }
          : null,
      ),
    listAncestorTeamIds: ({ teamId }) =>
      Promise.resolve(teamId === "child" ? ["parent"] : []),
  };
  const resolver: ResolveEffectiveRepositoryPermissionUseCase = {
    resolveEffectiveRepositoryPermission: () =>
      Promise.resolve({
        allowed: input?.admin ?? true,
        permission: input?.admin === false ? "read" : "admin",
        sources: [],
      }),
  };
  return new TeamRepositoryAccessService(
    grants,
    teams,
    resolver,
    new InMemoryTeamRepositoryGrantIdGeneratorAdapter(0),
  );
}

describe("TeamRepositoryAccessService", () => {
  it("grants and changes direct team access for repository admins", async () => {
    const service = createHarness();
    const granted = await service.grant({
      actorAccountId: "owner",
      repository,
      teamId: "team",
      permission: "read",
    });
    expect(granted).toMatchObject({ status: "granted" });

    await expect(
      service.change({
        actorAccountId: "owner",
        repository,
        teamId: "team",
        permission: "write",
      }),
    ).resolves.toMatchObject({
      status: "changed",
      grant: { permission: "write" },
    });
  });

  it("rejects grant creation without repository admin", async () => {
    const service = createHarness({ admin: false });

    await expect(
      service.grant({
        actorAccountId: "member",
        repository,
        teamId: "team",
        permission: "read",
      }),
    ).resolves.toEqual({ status: "permission-denied" });
  });

  it("allows a maintainer to revoke its direct grant", async () => {
    const service = createHarness({
      admin: false,
      maintainer: true,
      directGrant: true,
    });

    await expect(
      service.revoke({
        actorAccountId: "maintainer",
        repository,
        teamId: "team",
      }),
    ).resolves.toMatchObject({ status: "revoked" });
  });

  it("does not revoke inherited access from the child team", async () => {
    const service = createHarness({
      admin: true,
      maintainer: true,
      parentGrant: true,
    });

    await expect(
      service.revoke({
        actorAccountId: "owner",
        repository,
        teamId: "child",
      }),
    ).resolves.toEqual({
      status: "inherited-access-cannot-be-removed",
    });
  });
});
