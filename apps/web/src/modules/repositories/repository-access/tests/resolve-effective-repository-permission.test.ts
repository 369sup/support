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
      allowed: true,
      permission: "admin",
      sources: [
        { kind: "public-read" },
        { kind: "organization-owner", membershipId: "membership" },
        { kind: "direct-grant", grantId: "grant_read" },
      ],
    });
  });
});
