import { describe, expect, it } from "vitest";

import {
  InMemoryOrganizationMembershipAdapter,
  type OrganizationMembershipSeed,
} from "../adapters/outbound/persistence/in-memory-organization-membership.adapter";
import type { OrganizationInvitationAccountGatewayPort } from "../application/ports/outbound/organization-invitation-account.gateway.port";
import type { OrganizationMembershipClockPort } from "../application/ports/outbound/organization-membership-clock.port";
import type { OrganizationMembershipIdGeneratorPort } from "../application/ports/outbound/organization-membership-id-generator.port";
import { OrganizationMembershipService } from "../application/services/organization-membership.service";

const currentTime = new Date("2026-07-27T00:00:00.000Z");

const ownerMembership = {
  membershipId: "membership_owner",
  organizationId: "organization_test",
  accountId: "account_owner",
  role: "owner" as const,
  state: "active" as const,
  source: "direct" as const,
};

function createService(
  seed: OrganizationMembershipSeed = {
    memberships: [ownerMembership],
  },
  accounts: Readonly<
    Record<
      string,
      Readonly<{
        accountId: string;
        username: string;
        displayName: string;
        accountType: "personal" | "managed";
        usage: "human" | "machine";
      }>
    >
  > = {},
) {
  const repository = new InMemoryOrganizationMembershipAdapter(seed);
  const accountGateway: OrganizationInvitationAccountGatewayPort = {
    getActiveAccountByUsername(username) {
      return Promise.resolve(accounts[username] ?? null);
    },
  };
  let identifierSequence = 0;
  const idGenerator: OrganizationMembershipIdGeneratorPort = {
    nextId(kind) {
      identifierSequence += 1;
      return `${kind}_${identifierSequence}`;
    },
  };
  const clock: OrganizationMembershipClockPort = {
    now() {
      return currentTime;
    },
  };
  return {
    repository,
    service: new OrganizationMembershipService(
      repository,
      accountGateway,
      idGenerator,
      clock,
    ),
  };
}

describe("OrganizationMembershipService", () => {
  it("creates a seven-day personal-account invitation and pending membership atomically", async () => {
    const { repository, service } = createService(
      undefined,
      {
        invitee: {
          accountId: "account_invitee",
          username: "invitee",
          displayName: "Invitee",
          accountType: "personal",
          usage: "human",
        },
      },
    );

    const result = await service.invite({
      actorAccountId: "account_owner",
      organizationId: "organization_test",
      username: "invitee",
      role: "member",
    });

    expect(result.status).toBe("invited");
    if (result.status !== "invited") {
      return;
    }
    expect(result.invitation.expiresAt).toBe("2026-08-03T00:00:00.000Z");
    expect(result.membership.state).toBe("pending");
    await expect(
      repository.findByAccountAndOrganization(
        "account_invitee",
        "organization_test",
      ),
    ).resolves.toMatchObject({
      membershipId: result.membership.membershipId,
      state: "pending",
    });
  });

  it("rejects managed users because SCIM owns their organization provisioning", async () => {
    const { service } = createService(
      undefined,
      {
        managed: {
          accountId: "account_managed",
          username: "managed",
          displayName: "Managed User",
          accountType: "managed",
          usage: "human",
        },
      },
    );

    await expect(
      service.invite({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        username: "managed",
        role: "member",
      }),
    ).resolves.toEqual({ status: "managed-account-requires-scim" });
  });

  it("expires pending invitations and closes their pending memberships", async () => {
    const { repository, service } = createService({
      memberships: [
        ownerMembership,
        {
          membershipId: "membership_expired",
          organizationId: "organization_test",
          accountId: "account_invitee",
          role: "member",
          state: "pending",
          source: "direct",
        },
      ],
      invitations: [
        {
          invitationId: "invitation_expired",
          membershipId: "membership_expired",
          organizationId: "organization_test",
          accountId: "account_invitee",
          inviterAccountId: "account_owner",
          role: "member",
          state: "pending",
          createdAt: "2026-07-19T00:00:00.000Z",
          expiresAt: "2026-07-26T00:00:00.000Z",
          decidedAt: null,
        },
      ],
    });

    await expect(
      service.listPendingForAccount({
        actorAccountId: "account_invitee",
      }),
    ).resolves.toEqual({ status: "found", invitations: [] });
    await expect(
      repository.findInvitationById("invitation_expired"),
    ).resolves.toMatchObject({ state: "expired" });
    await expect(
      repository.findByMembershipId("membership_expired"),
    ).resolves.toMatchObject({ state: "removed" });
  });

  it("lets an owner edit or cancel a pending invitation", async () => {
    const { repository, service } = createService({
      memberships: [
        ownerMembership,
        {
          membershipId: "membership_pending",
          organizationId: "organization_test",
          accountId: "account_invitee",
          role: "member",
          state: "pending",
          source: "direct",
        },
      ],
      invitations: [
        {
          invitationId: "invitation_pending",
          membershipId: "membership_pending",
          organizationId: "organization_test",
          accountId: "account_invitee",
          inviterAccountId: "account_owner",
          role: "member",
          state: "pending",
          createdAt: "2026-07-26T00:00:00.000Z",
          expiresAt: "2026-08-02T00:00:00.000Z",
          decidedAt: null,
        },
      ],
    });

    await expect(
      service.updateInvitation({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        invitationId: "invitation_pending",
        role: "owner",
      }),
    ).resolves.toMatchObject({
      status: "updated",
      invitation: { role: "owner" },
    });
    await expect(
      service.cancelInvitation({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        invitationId: "invitation_pending",
      }),
    ).resolves.toMatchObject({
      status: "canceled",
      invitation: { state: "canceled" },
    });
    await expect(
      repository.findByMembershipId("membership_pending"),
    ).resolves.toMatchObject({ role: "owner", state: "removed" });
  });

  it("allows only the invitee to accept or decline a pending invitation", async () => {
    const seed: OrganizationMembershipSeed = {
      memberships: [
        ownerMembership,
        {
          membershipId: "membership_pending",
          organizationId: "organization_test",
          accountId: "account_invitee",
          role: "member",
          state: "pending",
          source: "direct",
        },
      ],
      invitations: [
        {
          invitationId: "invitation_pending",
          membershipId: "membership_pending",
          organizationId: "organization_test",
          accountId: "account_invitee",
          inviterAccountId: "account_owner",
          role: "member",
          state: "pending",
          createdAt: "2026-07-26T00:00:00.000Z",
          expiresAt: "2026-08-02T00:00:00.000Z",
          decidedAt: null,
        },
      ],
    };
    const denied = createService(seed).service;
    await expect(
      denied.acceptInvitation({
        actorAccountId: "account_other",
        invitationId: "invitation_pending",
      }),
    ).resolves.toEqual({ status: "invitation-not-for-actor" });

    const accepted = createService(seed);
    await expect(
      accepted.service.acceptInvitation({
        actorAccountId: "account_invitee",
        invitationId: "invitation_pending",
      }),
    ).resolves.toMatchObject({
      status: "accepted",
      membership: { state: "active" },
    });

    const declined = createService(seed);
    await expect(
      declined.service.declineInvitation({
        actorAccountId: "account_invitee",
        invitationId: "invitation_pending",
      }),
    ).resolves.toMatchObject({
      status: "declined",
      invitation: { state: "declined" },
    });
    await expect(
      declined.repository.findByMembershipId("membership_pending"),
    ).resolves.toMatchObject({ state: "removed" });
  });

  it("protects the last owner and rejects externally managed membership changes", async () => {
    const { service } = createService({
      memberships: [
        ownerMembership,
        {
          membershipId: "membership_member",
          organizationId: "organization_test",
          accountId: "account_member",
          role: "member",
          state: "active",
          source: "direct",
        },
        {
          membershipId: "membership_managed",
          organizationId: "organization_test",
          accountId: "account_managed",
          role: "member",
          state: "active",
          source: "enterprise-managed",
        },
      ],
    });

    await expect(
      service.changeRole({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        membershipId: "membership_owner",
        role: "member",
      }),
    ).resolves.toEqual({ status: "last-owner-protected" });
    await expect(
      service.changeRole({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        membershipId: "membership_member",
        role: "owner",
      }),
    ).resolves.toMatchObject({ status: "changed" });
    await expect(
      service.removeMember({
        actorAccountId: "account_owner",
        organizationId: "organization_test",
        membershipId: "membership_owner",
      }),
    ).resolves.toMatchObject({ status: "removed" });
    await expect(
      service.removeMember({
        actorAccountId: "account_member",
        organizationId: "organization_test",
        membershipId: "membership_managed",
      }),
    ).resolves.toEqual({ status: "membership-managed-externally" });
  });
});
