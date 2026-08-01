import { describe, expect, it } from "vitest";

import { getAccountReferenceById } from "./src/modules/identity/accounts/server-api";
import { authorizeEnterpriseAdministration } from "./src/modules/enterprises/enterprise-roles/server-api";
import { listEnterpriseOrganizations } from "./src/modules/enterprises/enterprises/server-api";
import { getOrganizationReferenceById } from "./src/modules/organizations/organizations/server-api";

describe("development catalog referential integrity", () => {
  it("resolves linked organizations and Carol's enterprise administration grant", async () => {
    await expect(
      getAccountReferenceById("account_carol_acme"),
    ).resolves.toMatchObject({ status: "found" });
    await expect(
      getOrganizationReferenceById("organization_acme_platform"),
    ).resolves.toMatchObject({ status: "found" });
    const enterpriseOrganizations =
      await listEnterpriseOrganizations("acme-enterprise");
    expect(enterpriseOrganizations.status).toBe("found");
    if (enterpriseOrganizations.status === "found") {
      expect(
        enterpriseOrganizations.organizations.some(
          (organization) => organization.login === "acme-platform",
        ),
      ).toBe(true);
    }
    await expect(
      authorizeEnterpriseAdministration({
        accountId: "account_carol_acme",
        enterpriseId: "enterprise_acme",
      }),
    ).resolves.toMatchObject({ status: "allowed" });
  });
});
