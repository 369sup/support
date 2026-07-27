import { describe, expect, it } from "vitest";

import { ResolveEffectiveRepositoryPermissionHandler } from "../application/queries/resolve-effective-repository-permission.handler";

describe("effective repository permission", () => {
  it("aggregates public, owner, and direct-grant sources without using context", async () => {
    const handler = new ResolveEffectiveRepositoryPermissionHandler(
      {
        findActiveByRepositoryAndAccount: () =>
          Promise.resolve([
            {
              grantId: "grant_read",
              repositoryId: "repository",
              accountId: "account",
              permission: "write",
              state: "active",
            },
          ]),
      },
      {
        getActiveMembership: () =>
          Promise.resolve({ membershipId: "membership", role: "owner" }),
      },
      {
        getBaseRepositoryPermission: () => Promise.resolve(null),
      },
      {
        findActiveByRepository: () => Promise.resolve([]),
        findActiveByRepositoryAndTeam: () => Promise.resolve(null),
        saveTeamGrant: () => Promise.resolve(),
      },
      {
        listAccountTeamPermissions: () => Promise.resolve([]),
        getTeamForActor: () => Promise.resolve(null),
        listAncestorTeamIds: () => Promise.resolve([]),
      },
      {
        listRepositoryPermissionContributions: () => Promise.resolve([]),
      },
    );
    const decision = await handler.resolveEffectiveRepositoryPermission({
      repository: {
        repositoryId: "repository",
        owner: { kind: "organization", organizationId: "organization" },
        visibility: "public",
      },
      accountId: "account",
    });

    expect(decision).toEqual({
      isAllowed: true,
      permission: "admin",
      effectiveBaseRole: "admin",
      additionalPermissions: ["write", "read"],
      capabilityDecisions: [
        {
          permission: "admin",
          source: { kind: "organization-owner", membershipId: "membership" },
        },
        {
          permission: "write",
          source: { kind: "direct-grant", grantId: "grant_read" },
        },
        {
          permission: "read",
          source: { kind: "public-read" },
        },
      ],
      sources: [
        { kind: "public-read" },
        { kind: "organization-owner", membershipId: "membership" },
        { kind: "direct-grant", grantId: "grant_read" },
      ],
    });
  });

  it("aggregates inherited team and organization-role sources", async () => {
    const handler = new ResolveEffectiveRepositoryPermissionHandler(
      {
        findActiveByRepositoryAndAccount: () => Promise.resolve([]),
      },
      {
        getActiveMembership: () =>
          Promise.resolve({ membershipId: "membership", role: "member" }),
      },
      {
        getBaseRepositoryPermission: () => Promise.resolve(null),
      },
      {
        findActiveByRepository: () =>
          Promise.resolve([
            {
              grantId: "team_grant",
              repositoryId: "repository",
              organizationId: "organization",
              teamId: "parent",
              permission: "triage",
              state: "active",
            },
          ]),
        findActiveByRepositoryAndTeam: () => Promise.resolve(null),
        saveTeamGrant: () => Promise.resolve(),
      },
      {
        listAccountTeamPermissions: () =>
          Promise.resolve([
            {
              directTeamId: "child",
              ancestorTeamIds: ["parent"],
              isMaintainer: false,
            },
          ]),
        getTeamForActor: () => Promise.resolve(null),
        listAncestorTeamIds: () => Promise.resolve([]),
      },
      {
        listRepositoryPermissionContributions: () =>
          Promise.resolve([
            {
              assignmentId: "role_assignment",
              roleKey: "all-repository-write",
              subject: { kind: "account", accountId: "account" },
              permission: "write",
            },
          ]),
      },
    );

    await expect(
      handler.resolveEffectiveRepositoryPermission({
        repository: {
          repositoryId: "repository",
          owner: { kind: "organization", organizationId: "organization" },
          visibility: "private",
        },
        accountId: "account",
      }),
    ).resolves.toEqual({
      isAllowed: true,
      permission: "write",
      effectiveBaseRole: "write",
      additionalPermissions: ["triage"],
      capabilityDecisions: [
        {
          permission: "write",
          source: {
            kind: "organization-role",
            assignmentId: "role_assignment",
            roleKey: "all-repository-write",
            subject: { kind: "account", accountId: "account" },
          },
        },
        {
          permission: "triage",
          source: {
            kind: "team-grant",
            grantId: "team_grant",
            teamId: "parent",
            matchedTeamId: "child",
            isInherited: true,
          },
        },
      ],
      sources: [
        {
          kind: "team-grant",
          grantId: "team_grant",
          teamId: "parent",
          matchedTeamId: "child",
          isInherited: true,
        },
        {
          kind: "organization-role",
          assignmentId: "role_assignment",
          roleKey: "all-repository-write",
          subject: { kind: "account", accountId: "account" },
        },
      ],
    });
  });

  it("grants the organization base permission to every active member", async () => {
    const handler = new ResolveEffectiveRepositoryPermissionHandler(
      {
        findActiveByRepositoryAndAccount: () => Promise.resolve([]),
      },
      {
        getActiveMembership: () =>
          Promise.resolve({ membershipId: "membership", role: "member" }),
      },
      {
        getBaseRepositoryPermission: () => Promise.resolve("read"),
      },
      {
        findActiveByRepository: () => Promise.resolve([]),
        findActiveByRepositoryAndTeam: () => Promise.resolve(null),
        saveTeamGrant: () => Promise.resolve(),
      },
      {
        listAccountTeamPermissions: () => Promise.resolve([]),
        getTeamForActor: () => Promise.resolve(null),
        listAncestorTeamIds: () => Promise.resolve([]),
      },
      {
        listRepositoryPermissionContributions: () => Promise.resolve([]),
      },
    );

    await expect(
      handler.resolveEffectiveRepositoryPermission({
        repository: {
          repositoryId: "repository",
          owner: {
            kind: "organization",
            organizationId: "organization",
          },
          visibility: "private",
        },
        accountId: "account",
      }),
    ).resolves.toMatchObject({
      isAllowed: true,
      permission: "read",
      sources: [
        {
          kind: "organization-base-permission",
          membershipId: "membership",
        },
      ],
    });
  });
});
