import { describe, expect, it } from "vitest";

import { AuthorizeEnterpriseAdministrationHandler } from "../application/queries/authorize-enterprise-administration.handler";

describe("enterprise administration authorization", () => {
  it("requires both active affiliation and view-enterprise permission", async () => {
    const allowed = new AuthorizeEnterpriseAdministrationHandler(
      { hasActiveAffiliation: () => Promise.resolve(true) },
      {
        findByAccountAndEnterprise: () =>
          Promise.resolve([
            {
              assignmentId: "assignment",
              enterpriseId: "enterprise",
              accountId: "account",
              roleName: "enterprise-admin",
              permissions: ["view-enterprise"],
            },
          ]),
      },
    );
    await expect(
      allowed.authorizeEnterpriseAdministration({
        accountId: "account",
        enterpriseId: "enterprise",
      }),
    ).resolves.toEqual({
      status: "allowed",
      roleName: "enterprise-admin",
      permissions: ["view-enterprise"],
    });

    const denied = new AuthorizeEnterpriseAdministrationHandler(
      { hasActiveAffiliation: () => Promise.resolve(false) },
      { findByAccountAndEnterprise: () => Promise.resolve([]) },
    );
    await expect(
      denied.authorizeEnterpriseAdministration({
        accountId: "account",
        enterpriseId: "enterprise",
      }),
    ).resolves.toEqual({
      status: "denied",
      reason: "membership-inactive",
    });
  });
});
