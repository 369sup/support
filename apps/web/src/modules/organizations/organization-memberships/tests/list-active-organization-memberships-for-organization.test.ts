import { describe, expect, it } from "vitest";

import { InMemoryOrganizationMembershipQueryAdapter } from "../adapters/outbound/persistence/in-memory-organization-membership-query.adapter";
import { ListActiveOrganizationMembershipsForOrganizationHandler } from "../application/queries/list-active-organization-memberships-for-organization.handler";

describe("ListActiveOrganizationMembershipsForOrganizationHandler", () => {
  it("returns only active memberships for the requested organization", async () => {
    const adapter = new InMemoryOrganizationMembershipQueryAdapter([
      {
        membershipId: "membership_1",
        organizationId: "organization_test",
        accountId: "account_member",
        role: "member",
        state: "active",
        source: "direct",
      },
      {
        membershipId: "membership_2",
        organizationId: "organization_test",
        accountId: "account_pending",
        role: "member",
        state: "pending",
        source: "direct",
      },
      {
        membershipId: "membership_3",
        organizationId: "organization_other",
        accountId: "account_owner",
        role: "owner",
        state: "active",
        source: "direct",
      },
    ]);
    const handler = new ListActiveOrganizationMembershipsForOrganizationHandler(adapter);

    const result = await handler.listActiveOrganizationMembershipsForOrganization({
      organizationId: "organization_test",
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      membershipId: "membership_1",
      organizationId: "organization_test",
      accountId: "account_member",
      state: "active",
      role: "member",
    });
  });
});
