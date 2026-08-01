import { describe, expect, it } from "vitest";

import type { EventRecorderPort } from "@/modules/platform/event-publication/integration-contracts";

import { InMemoryOrganizationRoleOutboxAdapter } from "../adapters/outbound/persistence/in-memory-organization-role-outbox.adapter";
import { InMemoryOrganizationRoleAssignmentAdapter } from "../adapters/outbound/persistence/in-memory-organization-role-assignment.adapter";
import { InMemoryOrganizationRoleIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-organization-role-id-generator.adapter";
import type { OrganizationMembershipGatewayPort } from "../application/ports/outbound/organization-membership.gateway.port";
import type { OrganizationTeamGatewayPort } from "../application/ports/outbound/organization-team.gateway.port";
import { OrganizationRoleService } from "../application/services/organization-role.service";

function createTestOutbox() {
  return new InMemoryOrganizationRoleOutboxAdapter(
    InMemoryOrganizationRoleOutboxAdapter.createState(),
    {
      nextEventId: () => "event_test",
      now: () => "2026-07-23T00:00:00.000Z",
    },
  );
}

function createHarness(
  assignments: ConstructorParameters<
    typeof InMemoryOrganizationRoleAssignmentAdapter
  >[0] = [],
  eventRecorder?: EventRecorderPort,
) {
  const membershipGateway: OrganizationMembershipGatewayPort = {
    getActiveMembership: (accountId, organizationId) => {
      if (
        organizationId !== "organization_test" ||
        !["owner", "member", "child-member"].includes(accountId)
      ) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        membershipId: `membership_${accountId}`,
        organizationId,
        accountId,
        role: accountId === "owner" ? "owner" : "member",
      });
    },
  };
  const teamGateway: OrganizationTeamGatewayPort = {
    isActiveTeam: ({ organizationId, teamId }) =>
      Promise.resolve(
        organizationId === "organization_test" &&
          ["team", "parent"].includes(teamId),
      ),
    listDirectTeamIdsForAccount: (accountId) =>
      Promise.resolve(accountId === "member" ? ["team"] : []),
  };
  return new OrganizationRoleService(
    new InMemoryOrganizationRoleAssignmentAdapter(assignments),
    membershipGateway,
    teamGateway,
    new InMemoryOrganizationRoleIdGeneratorAdapter(0),
    eventRecorder,
  );
}

describe("OrganizationRoleService", () => {
  it("lists immutable predefined roles for active members", async () => {
    const service = createHarness();
    const result = await service.listDefinitions({
      actorAccountId: "member",
      organizationId: "organization_test",
    });

    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.roles.map((role) => role.roleKey)).toContain(
        "all-repository-admin",
      );
      expect(
        result.roles.find((role) => role.roleKey === "security-manager")
          ?.repositoryPermission,
      ).toBe("read");
    }
  });

  it("allows owners to assign multiple roles and rejects duplicates", async () => {
    const service = createHarness();
    const command = {
      actorAccountId: "owner",
      organizationId: "organization_test",
      roleKey: "all-repository-read" as const,
      subject: { kind: "account" as const, accountId: "member" },
    };

    await expect(service.assign(command)).resolves.toMatchObject({
      status: "assigned",
    });
    await expect(service.assign(command)).resolves.toEqual({
      status: "assignment-conflict",
    });
    await expect(
      service.assign({
        ...command,
        roleKey: "all-repository-write",
      }),
    ).resolves.toMatchObject({ status: "assigned" });
  });

  it("does not let members administer role assignments", async () => {
    const service = createHarness();

    await expect(
      service.assign({
        actorAccountId: "member",
        organizationId: "organization_test",
        roleKey: "moderator",
        subject: { kind: "account", accountId: "member" },
      }),
    ).resolves.toEqual({ status: "permission-denied" });
    await expect(
      service.listAssignments({
        actorAccountId: "member",
        organizationId: "organization_test",
      }),
    ).resolves.toEqual({ status: "permission-denied" });
  });

  it("applies team roles to direct members but not child-team members", async () => {
    const service = createHarness([
      {
        assignmentId: "assignment_team_read",
        organizationId: "organization_test",
        roleKey: "all-repository-read",
        subject: { kind: "team", teamId: "team" },
        state: "active",
      },
    ]);

    await expect(
      service.resolveContributions({
        accountId: "member",
        organizationId: "organization_test",
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        assignmentId: "assignment_team_read",
        permission: "read",
      }),
    ]);
    await expect(
      service.resolveContributions({
        accountId: "child-member",
        organizationId: "organization_test",
      }),
    ).resolves.toEqual([]);
  });

  it("revokes an assignment immediately", async () => {
    const service = createHarness([
      {
        assignmentId: "assignment",
        organizationId: "organization_test",
        roleKey: "security-manager",
        subject: { kind: "account", accountId: "member" },
        state: "active",
      },
    ]);

    await expect(
      service.revoke({
        actorAccountId: "owner",
        organizationId: "organization_test",
        assignmentId: "assignment",
      }),
    ).resolves.toMatchObject({ status: "revoked" });
    await expect(
      service.resolveContributions({
        accountId: "member",
        organizationId: "organization_test",
      }),
    ).resolves.toEqual([]);
  });

  it("records assignment events after persistence succeeds", async () => {
    const outbox = createTestOutbox();
    const service = createHarness([], outbox);

    await expect(
      service.assign({
        actorAccountId: "owner",
        organizationId: "organization_test",
        roleKey: "security-manager",
        subject: { kind: "account", accountId: "member" },
      }),
    ).resolves.toMatchObject({ status: "assigned" });

    const events = await outbox.claimPending({
      claimedAt: "2026-07-23T00:00:01.000Z",
      limit: 10,
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      sourceContext: "organizations/organization-roles",
      eventName: "OrganizationRoleAssigned",
      payload: {
        organizationId: "organization_test",
        roleKey: "security-manager",
        subject: { kind: "account", accountId: "member" },
      },
    });
  });
});
