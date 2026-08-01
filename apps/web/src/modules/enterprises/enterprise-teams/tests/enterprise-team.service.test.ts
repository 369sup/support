import { describe, expect, it } from "vitest";

import { InMemoryEnterpriseTeamAdapter } from "../adapters/outbound/persistence/in-memory-enterprise-team.adapter";
import type { AccountReferenceGatewayPort } from "../application/ports/outbound/account-reference.gateway.port";
import type { EnterpriseAdministrationGatewayPort } from "../application/ports/outbound/enterprise-administration.gateway.port";
import type { EnterpriseReferenceGatewayPort } from "../application/ports/outbound/enterprise-reference.gateway.port";
import type { EnterpriseTeamIdGeneratorPort } from "../application/ports/outbound/enterprise-team-id-generator.port";
import type { OrganizationMembershipGatewayPort } from "../application/ports/outbound/organization-membership.gateway.port";
import type { OrganizationPolicyGatewayPort } from "../application/ports/outbound/organization-policy.gateway.port";
import type { OrganizationReferenceGatewayPort } from "../application/ports/outbound/organization-reference.gateway.port";
import { EnterpriseTeamService } from "../application/services/enterprise-team.service";

class EnterpriseReferenceGatewayFake
  implements EnterpriseReferenceGatewayPort
{
  getActiveEnterpriseBySlug(enterpriseSlug: string) {
    return Promise.resolve(
      enterpriseSlug === "acme-enterprise"
        ? {
            enterpriseId: "enterprise_acme",
            slug: "acme-enterprise",
          }
        : null,
    );
  }
}

class EnterpriseAdministrationGatewayFake
  implements EnterpriseAdministrationGatewayPort
{
  private readonly canManage: boolean;
  private readonly canView: boolean;

  constructor({
    canManage = true,
    canView = true,
  }: Readonly<{
    canManage?: boolean;
    canView?: boolean;
  }> = {}) {
    this.canManage = canManage;
    this.canView = canView;
  }

  canManageEnterpriseTeams() {
    return Promise.resolve(this.canManage);
  }

  canViewEnterpriseTeams() {
    return Promise.resolve(this.canView);
  }
}

class AccountReferenceGatewayFake implements AccountReferenceGatewayPort {
  getActiveAccountByUsername(username: string) {
    return Promise.resolve(
      username.toLocaleLowerCase("en-US") === "carol_acme"
        ? {
            accountId: "account_carol_acme",
            username: "carol_ACME",
            displayName: "Carol",
            accountType: "managed" as const,
          }
        : null,
    );
  }

  getActiveAccountById(accountId: string) {
    return this.getActiveAccountByUsername(
      accountId === "account_carol_acme" ? "carol_ACME" : "",
    );
  }
}

class EnterpriseTeamIdGeneratorFake
  implements EnterpriseTeamIdGeneratorPort
{
  private nextSequence = 0;

  nextId(kind: "team" | "membership" | "organization-grant") {
    this.nextSequence += 1;
    return `${kind}_${this.nextSequence}`;
  }
}

class OrganizationReferenceGatewayFake
  implements OrganizationReferenceGatewayPort
{
  getActiveOrganizationInEnterprise(
    enterpriseSlug: string,
    organizationId: string,
  ) {
    return Promise.resolve(
      enterpriseSlug === "acme-enterprise" &&
        organizationId === "organization_acme"
        ? {
            organizationId,
            login: "acme",
            displayName: "ACME",
          }
        : null,
    );
  }
}

class OrganizationMembershipGatewayFake
  implements OrganizationMembershipGatewayPort
{
  synchronizeEnterpriseTeamAssignment(input: {
    assignmentId: string;
    organizationId: string;
    accountIds: readonly string[];
  }) {
    return Promise.resolve(
      input.accountIds.map((accountId) => ({
        membershipId: `${input.assignmentId}_${accountId}`,
        organizationId: input.organizationId,
        accountId,
        role: "member" as const,
        state: "active" as const,
        source: "enterprise-managed" as const,
      })),
    );
  }
}

class OrganizationPolicyGatewayFake
  implements OrganizationPolicyGatewayPort
{
  getBaseRepositoryPermission() {
    return Promise.resolve("read" as const);
  }
}

function createService(
  administrationGateway = new EnterpriseAdministrationGatewayFake(),
) {
  return new EnterpriseTeamService(
    new InMemoryEnterpriseTeamAdapter({
      teams: [],
      memberships: [],
    }),
    new EnterpriseReferenceGatewayFake(),
    administrationGateway,
    new AccountReferenceGatewayFake(),
    new OrganizationReferenceGatewayFake(),
    new OrganizationMembershipGatewayFake(),
    new OrganizationPolicyGatewayFake(),
    new EnterpriseTeamIdGeneratorFake(),
  );
}

describe("EnterpriseTeamService", () => {
  it("creates, renames, lists, and deletes an enterprise team", async () => {
    const service = createService();
    const created = await service.create({
      actorAccountId: "account_owner",
      enterpriseSlug: "acme-enterprise",
      name: "Platform Näme",
      description: " Cross-organization operations. ",
    });

    expect(created).toEqual({
      status: "created",
      team: {
        teamId: "team_1",
        enterpriseId: "enterprise_acme",
        name: "Platform Näme",
        slug: "platform-name",
        description: "Cross-organization operations.",
        lifecycleState: "active",
      },
    });
    if (created.status !== "created") {
      throw new Error("Expected a created enterprise team.");
    }

    await expect(
      service.update({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
        name: "Platform Operations",
        description: "Operations",
      }),
    ).resolves.toMatchObject({
      status: "updated",
      team: { slug: "platform-operations" },
    });
    await expect(
      service.list({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
      }),
    ).resolves.toMatchObject({
      status: "found",
      teams: [{ slug: "platform-operations" }],
    });
    await expect(
      service.delete({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
      }),
    ).resolves.toMatchObject({ status: "deleted" });
    await expect(
      service.list({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
      }),
    ).resolves.toEqual({ status: "found", teams: [] });
  });

  it("adds and removes a managed user without changing enterprise membership", async () => {
    const service = createService();
    const created = await service.create({
      actorAccountId: "account_owner",
      enterpriseSlug: "acme-enterprise",
      name: "Audit",
      description: "",
    });
    if (created.status !== "created") {
      throw new Error("Expected a created enterprise team.");
    }

    const added = await service.addMember({
      actorAccountId: "account_owner",
      enterpriseSlug: "acme-enterprise",
      teamId: created.team.teamId,
      username: "CAROL_acme",
    });
    expect(added).toMatchObject({
      status: "added",
      account: {
        accountId: "account_carol_acme",
        accountType: "managed",
      },
    });
    await expect(
      service.addMember({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
        username: "carol_ACME",
      }),
    ).resolves.toEqual({ status: "already-team-member" });
    await expect(
      service.listMembers({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
      }),
    ).resolves.toMatchObject({
      status: "found",
      members: [{ account: { username: "carol_ACME" } }],
    });
    await expect(
      service.removeMember({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
        accountId: "account_carol_acme",
      }),
    ).resolves.toMatchObject({ status: "removed" });
  });

  it("allows enterprise administration reads but requires an owner for writes", async () => {
    const service = createService(
      new EnterpriseAdministrationGatewayFake({
        canManage: false,
        canView: true,
      }),
    );

    await expect(
      service.list({
        actorAccountId: "account_admin",
        enterpriseSlug: "acme-enterprise",
      }),
    ).resolves.toEqual({ status: "found", teams: [] });
    await expect(
      service.create({
        actorAccountId: "account_admin",
        enterpriseSlug: "acme-enterprise",
        name: "Owners only",
        description: "",
      }),
    ).resolves.toEqual({ status: "permission-denied" });
  });

  it("does not disclose whether a team exists in another enterprise", async () => {
    const service = createService();

    await expect(
      service.list({
        actorAccountId: "account_owner",
        enterpriseSlug: "missing-enterprise",
      }),
    ).resolves.toEqual({ status: "enterprise-not-found" });
    await expect(
      service.delete({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: "missing-team",
      }),
    ).resolves.toEqual({ status: "team-not-found" });
  });

  it("assigns a team to an enterprise organization with direct membership and base permission", async () => {
    const service = createService();
    const created = await service.create({
      actorAccountId: "account_owner",
      enterpriseSlug: "acme-enterprise",
      name: "Organization access",
      description: "",
    });
    if (created.status !== "created") {
      throw new Error("Expected a created enterprise team.");
    }
    await service.addMember({
      actorAccountId: "account_owner",
      enterpriseSlug: "acme-enterprise",
      teamId: created.team.teamId,
      username: "carol_acme",
    });

    await expect(
      service.assignToOrganization({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
        organizationId: "organization_acme",
      }),
    ).resolves.toMatchObject({
      status: "assigned",
      assignment: {
        organization: { login: "acme" },
        baseRepositoryPermission: "read",
      },
      memberships: [
        {
          accountId: "account_carol_acme",
          state: "active",
          source: "enterprise-managed",
        },
      ],
    });
    await expect(
      service.listOrganizationAssignments({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
      }),
    ).resolves.toMatchObject({
      status: "found",
      assignments: [{ organization: { organizationId: "organization_acme" } }],
    });
    await expect(
      service.unassignFromOrganization({
        actorAccountId: "account_owner",
        enterpriseSlug: "acme-enterprise",
        teamId: created.team.teamId,
        organizationId: "organization_acme",
      }),
    ).resolves.toMatchObject({ status: "unassigned" });
  });
});
