import type {
  AcceptOrganizationInvitationCommand,
  AcceptOrganizationInvitationResult,
} from "../ports/inbound/accept-organization-invitation.use-case";
import type {
  CancelOrganizationInvitationCommand,
  CancelOrganizationInvitationResult,
} from "../ports/inbound/cancel-organization-invitation.use-case";
import type {
  ChangeOrganizationMemberRoleCommand,
  ChangeOrganizationMemberRoleResult,
} from "../ports/inbound/change-organization-member-role.use-case";
import type {
  DeclineOrganizationInvitationCommand,
  DeclineOrganizationInvitationResult,
} from "../ports/inbound/decline-organization-invitation.use-case";
import type {
  InviteOrganizationMemberCommand,
  InviteOrganizationMemberResult,
} from "../ports/inbound/invite-organization-member.use-case";
import type {
  ListOrganizationInvitationsForOrganizationQuery,
  ListOrganizationInvitationsForOrganizationResult,
} from "../ports/inbound/list-organization-invitations-for-organization.use-case";
import type {
  ListPendingOrganizationInvitationsForAccountQuery,
  ListPendingOrganizationInvitationsForAccountResult,
} from "../ports/inbound/list-pending-organization-invitations-for-account.use-case";
import type {
  RemoveOrganizationMemberCommand,
  RemoveOrganizationMemberResult,
} from "../ports/inbound/remove-organization-member.use-case";
import type {
  UpdateOrganizationInvitationCommand,
  UpdateOrganizationInvitationResult,
} from "../ports/inbound/update-organization-invitation.use-case";
import type {
  SynchronizeEnterpriseTeamOrganizationMembershipsCommand,
  SynchronizeEnterpriseTeamOrganizationMembershipsResult,
} from "../ports/inbound/synchronize-enterprise-team-organization-memberships.use-case";
import type { OrganizationInvitationAccountGatewayPort } from "../ports/outbound/organization-invitation-account.gateway.port";
import type { OrganizationMembershipClockPort } from "../ports/outbound/organization-membership-clock.port";
import type { OrganizationMembershipIdGeneratorPort } from "../ports/outbound/organization-membership-id-generator.port";
import type {
  OrganizationInvitationSnapshot,
  OrganizationMembershipQueryRepositoryPort,
  OrganizationMembershipQuerySnapshot,
} from "../ports/outbound/organization-membership-query.repository.port";
import { canChangeDirectOrganizationMembership } from "../../domain/policies/direct-organization-membership.policy";
import { isOrganizationInvitationExpired } from "../../domain/policies/organization-invitation-expiration.policy";
import { isOrganizationMembershipRole } from "../../domain/policies/organization-membership-role.policy";
import { wouldRemoveLastOrganizationOwner } from "../../domain/policies/organization-owner-continuity.policy";

const organizationInvitationLifetimeMilliseconds = 7 * 24 * 60 * 60 * 1_000;

export class OrganizationMembershipService {
  private readonly repository: OrganizationMembershipQueryRepositoryPort;
  private readonly accountGateway: OrganizationInvitationAccountGatewayPort;
  private readonly idGenerator: OrganizationMembershipIdGeneratorPort;
  private readonly clock: OrganizationMembershipClockPort;

  constructor(
    repository: OrganizationMembershipQueryRepositoryPort,
    accountGateway: OrganizationInvitationAccountGatewayPort,
    idGenerator: OrganizationMembershipIdGeneratorPort,
    clock: OrganizationMembershipClockPort,
  ) {
    this.repository = repository;
    this.accountGateway = accountGateway;
    this.idGenerator = idGenerator;
    this.clock = clock;
  }

  async invite(
    command: InviteOrganizationMemberCommand,
  ): Promise<InviteOrganizationMemberResult> {
    if (
      !(await this.isOrganizationOwner(
        command.actorAccountId,
        command.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }
    if (!isOrganizationMembershipRole(command.role)) {
      return { status: "invalid-role" };
    }

    const account = await this.accountGateway.getActiveAccountByUsername(
      command.username.trim(),
    );
    if (account === null || account.usage !== "human") {
      return { status: "account-not-found" };
    }
    if (account.accountType === "managed") {
      return { status: "managed-account-requires-scim" };
    }

    const currentMembership =
      await this.repository.findByAccountAndOrganization(
        account.accountId,
        command.organizationId,
      );
    if (currentMembership?.state === "active") {
      return { status: "already-member" };
    }

    const latestInvitation =
      await this.repository.findLatestInvitationByAccountAndOrganization(
        account.accountId,
        command.organizationId,
      );
    if (latestInvitation !== null) {
      const refreshedInvitation =
        await this.refreshInvitationState(latestInvitation);
      if (refreshedInvitation.state === "pending") {
        return { status: "invitation-already-pending" };
      }
    }

    const currentTime = this.clock.now();
    const membership: OrganizationMembershipQuerySnapshot = {
      membershipId: this.idGenerator.nextId("membership"),
      organizationId: command.organizationId,
      accountId: account.accountId,
      role: command.role,
      state: "pending",
      source: "direct",
    };
    const invitation: OrganizationInvitationSnapshot = {
      invitationId: this.idGenerator.nextId("invitation"),
      membershipId: membership.membershipId,
      organizationId: command.organizationId,
      accountId: account.accountId,
      inviterAccountId: command.actorAccountId,
      role: command.role,
      state: "pending",
      createdAt: currentTime.toISOString(),
      expiresAt: new Date(
        currentTime.getTime() + organizationInvitationLifetimeMilliseconds,
      ).toISOString(),
      decidedAt: null,
    };
    await this.repository.saveInvitationWithMembership(
      invitation,
      membership,
    );
    return { status: "invited", invitation, membership };
  }

  async listForOrganization(
    query: ListOrganizationInvitationsForOrganizationQuery,
  ): Promise<ListOrganizationInvitationsForOrganizationResult> {
    if (
      !(await this.isOrganizationOwner(
        query.actorAccountId,
        query.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }
    const invitations = await this.repository.listInvitationsByOrganization(
      query.organizationId,
    );
    const refreshedInvitations = await Promise.all(
      invitations.map((invitation) =>
        this.refreshInvitationState(invitation),
      ),
    );
    return {
      status: "found",
      invitations: refreshedInvitations.toSorted((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    };
  }

  async listPendingForAccount(
    query: ListPendingOrganizationInvitationsForAccountQuery,
  ): Promise<ListPendingOrganizationInvitationsForAccountResult> {
    const invitations = await this.repository.listInvitationsByAccount(
      query.actorAccountId,
    );
    const refreshedInvitations = await Promise.all(
      invitations.map((invitation) =>
        this.refreshInvitationState(invitation),
      ),
    );
    return {
      status: "found",
      invitations: refreshedInvitations
        .filter((invitation) => invitation.state === "pending")
        .toSorted((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
    };
  }

  async updateInvitation(
    command: UpdateOrganizationInvitationCommand,
  ): Promise<UpdateOrganizationInvitationResult> {
    if (
      !(await this.isOrganizationOwner(
        command.actorAccountId,
        command.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }
    if (!isOrganizationMembershipRole(command.role)) {
      return { status: "invalid-role" };
    }

    const invitation = await this.findScopedInvitation(
      command.invitationId,
      command.organizationId,
    );
    if (invitation === null) {
      return { status: "invitation-not-found" };
    }
    const refreshedInvitation = await this.refreshInvitationState(invitation);
    if (refreshedInvitation.state === "expired") {
      return { status: "invitation-expired" };
    }
    if (refreshedInvitation.state !== "pending") {
      return { status: "invitation-not-pending" };
    }

    const membership = await this.requireInvitationMembership(
      refreshedInvitation,
    );
    const updatedInvitation = {
      ...refreshedInvitation,
      role: command.role,
    };
    await this.repository.saveInvitationWithMembership(updatedInvitation, {
      ...membership,
      role: command.role,
    });
    return { status: "updated", invitation: updatedInvitation };
  }

  async cancelInvitation(
    command: CancelOrganizationInvitationCommand,
  ): Promise<CancelOrganizationInvitationResult> {
    if (
      !(await this.isOrganizationOwner(
        command.actorAccountId,
        command.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }

    const invitation = await this.findScopedInvitation(
      command.invitationId,
      command.organizationId,
    );
    if (invitation === null) {
      return { status: "invitation-not-found" };
    }
    const refreshedInvitation = await this.refreshInvitationState(invitation);
    if (
      refreshedInvitation.state !== "pending" &&
      refreshedInvitation.state !== "expired"
    ) {
      return { status: "invitation-not-pending" };
    }

    const membership = await this.requireInvitationMembership(
      refreshedInvitation,
    );
    const canceledInvitation = {
      ...refreshedInvitation,
      state: "canceled" as const,
      decidedAt: this.clock.now().toISOString(),
    };
    await this.repository.saveInvitationWithMembership(canceledInvitation, {
      ...membership,
      state: "removed",
    });
    return { status: "canceled", invitation: canceledInvitation };
  }

  async acceptInvitation(
    command: AcceptOrganizationInvitationCommand,
  ): Promise<AcceptOrganizationInvitationResult> {
    const invitation = await this.repository.findInvitationById(
      command.invitationId,
    );
    if (invitation === null) {
      return { status: "invitation-not-found" };
    }
    if (invitation.accountId !== command.actorAccountId) {
      return { status: "invitation-not-for-actor" };
    }
    const refreshedInvitation = await this.refreshInvitationState(invitation);
    if (refreshedInvitation.state === "expired") {
      return { status: "invitation-expired" };
    }
    if (refreshedInvitation.state !== "pending") {
      return { status: "invitation-not-pending" };
    }

    const membership = await this.requireInvitationMembership(
      refreshedInvitation,
    );
    if (membership.state === "active") {
      return { status: "already-member" };
    }

    const acceptedInvitation = {
      ...refreshedInvitation,
      state: "accepted" as const,
      decidedAt: this.clock.now().toISOString(),
    };
    const activeMembership = {
      ...membership,
      state: "active" as const,
    };
    await this.repository.saveInvitationWithMembership(
      acceptedInvitation,
      activeMembership,
    );
    return {
      status: "accepted",
      invitation: acceptedInvitation,
      membership: activeMembership,
    };
  }

  async declineInvitation(
    command: DeclineOrganizationInvitationCommand,
  ): Promise<DeclineOrganizationInvitationResult> {
    const invitation = await this.repository.findInvitationById(
      command.invitationId,
    );
    if (invitation === null) {
      return { status: "invitation-not-found" };
    }
    if (invitation.accountId !== command.actorAccountId) {
      return { status: "invitation-not-for-actor" };
    }
    const refreshedInvitation = await this.refreshInvitationState(invitation);
    if (refreshedInvitation.state === "expired") {
      return { status: "invitation-expired" };
    }
    if (refreshedInvitation.state !== "pending") {
      return { status: "invitation-not-pending" };
    }

    const membership = await this.requireInvitationMembership(
      refreshedInvitation,
    );
    const declinedInvitation = {
      ...refreshedInvitation,
      state: "declined" as const,
      decidedAt: this.clock.now().toISOString(),
    };
    await this.repository.saveInvitationWithMembership(declinedInvitation, {
      ...membership,
      state: "removed",
    });
    return { status: "declined", invitation: declinedInvitation };
  }

  async changeRole(
    command: ChangeOrganizationMemberRoleCommand,
  ): Promise<ChangeOrganizationMemberRoleResult> {
    if (
      !(await this.isOrganizationOwner(
        command.actorAccountId,
        command.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }
    if (!isOrganizationMembershipRole(command.role)) {
      return { status: "invalid-role" };
    }

    const membership = await this.findScopedActiveMembership(
      command.membershipId,
      command.organizationId,
    );
    if (membership === null) {
      return { status: "membership-not-found" };
    }
    if (!canChangeDirectOrganizationMembership(membership.source)) {
      return { status: "membership-managed-externally" };
    }
    if (
      wouldRemoveLastOrganizationOwner(
        membership.role,
        command.role,
        await this.repository.countActiveOwnersByOrganization(
          command.organizationId,
        ),
      )
    ) {
      return { status: "last-owner-protected" };
    }

    const changedMembership = {
      ...membership,
      role: command.role,
    };
    await this.repository.saveMembership(changedMembership);
    return { status: "changed", membership: changedMembership };
  }

  async removeMember(
    command: RemoveOrganizationMemberCommand,
  ): Promise<RemoveOrganizationMemberResult> {
    if (
      !(await this.isOrganizationOwner(
        command.actorAccountId,
        command.organizationId,
      ))
    ) {
      return { status: "permission-denied" };
    }

    const membership = await this.findScopedActiveMembership(
      command.membershipId,
      command.organizationId,
    );
    if (membership === null) {
      return { status: "membership-not-found" };
    }
    if (!canChangeDirectOrganizationMembership(membership.source)) {
      return { status: "membership-managed-externally" };
    }
    if (
      wouldRemoveLastOrganizationOwner(
        membership.role,
        "removed",
        await this.repository.countActiveOwnersByOrganization(
          command.organizationId,
        ),
      )
    ) {
      return { status: "last-owner-protected" };
    }

    const removedMembership = {
      ...membership,
      state: "removed" as const,
    };
    await this.repository.saveMembership(removedMembership);
    return { status: "removed", membership: removedMembership };
  }

  async synchronizeEnterpriseTeamOrganizationMemberships(
    command: SynchronizeEnterpriseTeamOrganizationMembershipsCommand,
  ): Promise<SynchronizeEnterpriseTeamOrganizationMembershipsResult> {
    const uniqueAccountIds = [...new Set(command.accountIds)];
    const generatedMembershipIds = await Promise.all(
      uniqueAccountIds.map(async (accountId) => {
        const membership =
          await this.repository.findByAccountAndOrganization(
            accountId,
            command.organizationId,
          );
        return {
          accountId,
          membershipId:
            membership?.membershipId ??
            this.idGenerator.nextId("membership"),
        };
      }),
    );
    const memberships =
      await this.repository.synchronizeEnterpriseTeamAssignment({
        assignmentId: command.assignmentId,
        organizationId: command.organizationId,
        accountIds: uniqueAccountIds,
        generatedMembershipIds,
        decidedAt: this.clock.now().toISOString(),
      });
    return { status: "synchronized", memberships };
  }

  private async isOrganizationOwner(
    accountId: string,
    organizationId: string,
  ): Promise<boolean> {
    const membership =
      await this.repository.findByAccountAndOrganization(
        accountId,
        organizationId,
      );
    return membership?.state === "active" && membership.role === "owner";
  }

  private async findScopedInvitation(
    invitationId: string,
    organizationId: string,
  ): Promise<OrganizationInvitationSnapshot | null> {
    const invitation =
      await this.repository.findInvitationById(invitationId);
    return invitation?.organizationId === organizationId ? invitation : null;
  }

  private async findScopedActiveMembership(
    membershipId: string,
    organizationId: string,
  ): Promise<OrganizationMembershipQuerySnapshot | null> {
    const membership =
      await this.repository.findByMembershipId(membershipId);
    return membership?.organizationId === organizationId &&
      membership.state === "active"
      ? membership
      : null;
  }

  private async refreshInvitationState(
    invitation: OrganizationInvitationSnapshot,
  ): Promise<OrganizationInvitationSnapshot> {
    if (
      invitation.state !== "pending" ||
      !isOrganizationInvitationExpired(invitation.expiresAt, this.clock.now())
    ) {
      return invitation;
    }

    const membership = await this.requireInvitationMembership(invitation);
    const expiredInvitation = {
      ...invitation,
      state: "expired" as const,
      decidedAt: this.clock.now().toISOString(),
    };
    await this.repository.saveInvitationWithMembership(expiredInvitation, {
      ...membership,
      state: "removed",
    });
    return expiredInvitation;
  }

  private async requireInvitationMembership(
    invitation: OrganizationInvitationSnapshot,
  ): Promise<OrganizationMembershipQuerySnapshot> {
    const membership = await this.repository.findByMembershipId(
      invitation.membershipId,
    );
    if (membership === null) {
      throw new Error("Organization invitation membership is missing.");
    }
    return membership;
  }
}
