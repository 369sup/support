import { describe, expect, it } from "vitest";

import {
  InMemoryOrganizationTeamAdapter,
  type OrganizationTeamSeed,
} from "../adapters/outbound/persistence/in-memory-organization-team.adapter";
import { InMemoryTeamIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-team-id-generator.adapter";
import type { OrganizationMembershipGatewayPort } from "../application/ports/outbound/organization-membership.gateway.port";
import { OrganizationTeamService } from "../application/services/organization-team.service";

function createHarness(seed?: OrganizationTeamSeed) {
  const memberships = new Map([
    [
      "owner",
      {
        membershipId: "organization_membership_owner",
        organizationId: "organization_test",
        accountId: "owner",
        role: "owner" as const,
      },
    ],
    [
      "member",
      {
        membershipId: "organization_membership_member",
        organizationId: "organization_test",
        accountId: "member",
        role: "member" as const,
      },
    ],
    [
      "second-member",
      {
        membershipId: "organization_membership_second",
        organizationId: "organization_test",
        accountId: "second-member",
        role: "member" as const,
      },
    ],
  ]);
  const membershipGateway: OrganizationMembershipGatewayPort = {
    getActiveMembership: (accountId, organizationId) =>
      Promise.resolve(
        organizationId === "organization_test"
          ? (memberships.get(accountId) ?? null)
          : null,
      ),
  };
  const repository = new InMemoryOrganizationTeamAdapter(
    seed ?? { teams: [], memberships: [], maintainers: [] },
  );
  return new OrganizationTeamService(
    repository,
    membershipGateway,
    {
      isActiveOrganization: (organizationId) =>
        Promise.resolve(organizationId === "organization_test"),
    },
    new InMemoryTeamIdGeneratorAdapter(0),
  );
}

describe("OrganizationTeamService", () => {
  it("creates teams for owners and rejects duplicate slugs", async () => {
    const service = createHarness();
    const input = {
      actorAccountId: "owner",
      organizationId: "organization_test",
      name: "Platform",
      slug: "platform",
      description: "Platform team",
      visibility: "visible" as const,
    };

    await expect(service.create(input)).resolves.toMatchObject({
      status: "created",
      team: { slug: "platform" },
    });
    await expect(service.create(input)).resolves.toEqual({
      status: "team-slug-conflict",
    });
    await expect(
      service.create({ ...input, actorAccountId: "member", slug: "other" }),
    ).resolves.toEqual({ status: "permission-denied" });
  });

  it("rejects cycles and secret teams in a hierarchy", async () => {
    const service = createHarness({
      teams: [
        {
          teamId: "parent",
          organizationId: "organization_test",
          name: "Parent",
          slug: "parent",
          description: "",
          visibility: "visible",
          parentTeamId: null,
          lifecycleState: "active",
        },
        {
          teamId: "child",
          organizationId: "organization_test",
          name: "Child",
          slug: "child",
          description: "",
          visibility: "visible",
          parentTeamId: "parent",
          lifecycleState: "active",
        },
      ],
      memberships: [],
      maintainers: [],
    });

    await expect(
      service.update({
        actorAccountId: "owner",
        teamId: "parent",
        parentTeamId: "child",
      }),
    ).resolves.toEqual({ status: "team-hierarchy-cycle" });
    await expect(
      service.update({
        actorAccountId: "owner",
        teamId: "parent",
        visibility: "secret",
      }),
    ).resolves.toEqual({ status: "secret-team-cannot-be-nested" });
  });

  it("requires direct membership before assigning a maintainer", async () => {
    const service = createHarness({
      teams: [
        {
          teamId: "team",
          organizationId: "organization_test",
          name: "Team",
          slug: "team",
          description: "",
          visibility: "visible",
          parentTeamId: null,
          lifecycleState: "active",
        },
      ],
      memberships: [],
      maintainers: [],
    });

    await expect(
      service.assignMaintainer({
        actorAccountId: "owner",
        teamId: "team",
        targetAccountId: "member",
      }),
    ).resolves.toEqual({ status: "team-member-not-found" });
    await expect(
      service.addMember({
        actorAccountId: "owner",
        teamId: "team",
        targetAccountId: "member",
      }),
    ).resolves.toMatchObject({ status: "added" });
    await expect(
      service.assignMaintainer({
        actorAccountId: "owner",
        teamId: "team",
        targetAccountId: "member",
      }),
    ).resolves.toMatchObject({ status: "assigned" });
    await expect(
      service.addMember({
        actorAccountId: "member",
        teamId: "team",
        targetAccountId: "second-member",
      }),
    ).resolves.toMatchObject({ status: "added" });
  });

  it("resolves parent teams as repository-grant ancestors only", async () => {
    const service = createHarness({
      teams: [
        {
          teamId: "parent",
          organizationId: "organization_test",
          name: "Parent",
          slug: "parent",
          description: "",
          visibility: "visible",
          parentTeamId: null,
          lifecycleState: "active",
        },
        {
          teamId: "child",
          organizationId: "organization_test",
          name: "Child",
          slug: "child",
          description: "",
          visibility: "visible",
          parentTeamId: "parent",
          lifecycleState: "active",
        },
      ],
      memberships: [
        {
          teamMembershipId: "membership",
          teamId: "child",
          organizationId: "organization_test",
          accountId: "member",
          state: "active",
        },
      ],
      maintainers: [],
    });

    await expect(
      service.resolveMemberships({
        accountId: "member",
        organizationId: "organization_test",
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        membership: expect.objectContaining({ teamId: "child" }),
        ancestorTeamIds: ["parent"],
      }),
    ]);
  });
});
