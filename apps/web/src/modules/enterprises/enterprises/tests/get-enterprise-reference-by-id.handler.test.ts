import { describe, expect, it } from "vitest";

import { InMemoryEnterpriseQueryAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-query.adapter";
import { GetEnterpriseReferenceByIdHandler } from "../application/queries/get-enterprise-reference-by-id.handler";

describe("get enterprise reference by ID", () => {
  const handler = new GetEnterpriseReferenceByIdHandler(
    new InMemoryEnterpriseQueryAdapter(),
  );

  it("returns an active enterprise reference", async () => {
    await expect(
      handler.getEnterpriseReferenceById({
        enterpriseId: "enterprise_acme",
      }),
    ).resolves.toMatchObject({
      status: "found",
      enterprise: {
        enterpriseId: "enterprise_acme",
        slug: "acme-enterprise",
        lifecycleState: "active",
      },
    });
  });

  it("does not expose an unknown enterprise", async () => {
    await expect(
      handler.getEnterpriseReferenceById({
        enterpriseId: "enterprise_unknown",
      }),
    ).resolves.toEqual({ status: "enterprise-not-found" });
  });
});
