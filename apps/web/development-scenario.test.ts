import { describe, expect, it } from "vitest";

import { getAccountReferenceById } from "./src/modules/identity/accounts/server-api";
import { createDevelopmentSession } from "./src/modules/identity/authentication/server-api";
import { authorizeEnterpriseAdministration } from "./src/modules/enterprises/enterprise-roles/server-api";
import { listEnterpriseOrganizations } from "./src/modules/enterprises/enterprises/server-api";
import { getOrganizationReferenceById } from "./src/modules/organizations/organizations/server-api";
import {
  getDashboardRepositoryView,
  selectDashboardContext,
} from "./src/modules/projections/dashboard/server-api";

describe("development scenario referential integrity", () => {
  it("resolves linked organizations and Carol's explicit internal repository grant", async () => {
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

    const created = await createDevelopmentSession({
      browserToken: null,
      username: "carol_ACME",
      password: "github",
    });
    expect(created.status).toBe("created");
    if (created.status !== "created") {
      return;
    }
    await expect(
      selectDashboardContext(created.session, {
        kind: "organization",
        id: "organization_acme_platform",
      }),
    ).resolves.toMatchObject({ status: "selected" });
    await expect(
      getDashboardRepositoryView(created.session),
    ).resolves.toMatchObject({
      repositories: [
        expect.objectContaining({
          name: "internal-tools",
          permission: "read",
        }),
      ],
    });
  });
});
