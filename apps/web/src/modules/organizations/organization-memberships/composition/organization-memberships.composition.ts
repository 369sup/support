import { OrganizationInvitationAccountAdapter } from "../adapters/outbound/integration/organization-invitation-account.adapter";
import { InMemoryOrganizationMembershipAdapter } from "../adapters/outbound/persistence/in-memory-organization-membership.adapter";
import { InMemoryOrganizationMembershipIdGeneratorAdapter } from "../adapters/outbound/persistence/in-memory-organization-membership-id-generator.adapter";
import { SystemOrganizationMembershipClockAdapter } from "../adapters/outbound/persistence/system-organization-membership-clock.adapter";
import { AcceptOrganizationInvitationHandler } from "../application/commands/accept-organization-invitation.handler";
import { CancelOrganizationInvitationHandler } from "../application/commands/cancel-organization-invitation.handler";
import { ChangeOrganizationMemberRoleHandler } from "../application/commands/change-organization-member-role.handler";
import { DeclineOrganizationInvitationHandler } from "../application/commands/decline-organization-invitation.handler";
import { InviteOrganizationMemberHandler } from "../application/commands/invite-organization-member.handler";
import { RemoveOrganizationMemberHandler } from "../application/commands/remove-organization-member.handler";
import { UpdateOrganizationInvitationHandler } from "../application/commands/update-organization-invitation.handler";
import type { AcceptOrganizationInvitationUseCase } from "../application/ports/inbound/accept-organization-invitation.use-case";
import type { CancelOrganizationInvitationUseCase } from "../application/ports/inbound/cancel-organization-invitation.use-case";
import type { ChangeOrganizationMemberRoleUseCase } from "../application/ports/inbound/change-organization-member-role.use-case";
import type { DeclineOrganizationInvitationUseCase } from "../application/ports/inbound/decline-organization-invitation.use-case";
import type { InviteOrganizationMemberUseCase } from "../application/ports/inbound/invite-organization-member.use-case";
import type { ListOrganizationInvitationsForOrganizationUseCase } from "../application/ports/inbound/list-organization-invitations-for-organization.use-case";
import type { ListPendingOrganizationInvitationsForAccountUseCase } from "../application/ports/inbound/list-pending-organization-invitations-for-account.use-case";
import type { RemoveOrganizationMemberUseCase } from "../application/ports/inbound/remove-organization-member.use-case";
import type { UpdateOrganizationInvitationUseCase } from "../application/ports/inbound/update-organization-invitation.use-case";
import { CheckOrganizationContextEligibilityHandler } from "../application/queries/check-organization-context-eligibility.handler";
import { ListActiveOrganizationMembershipsForAccountHandler } from "../application/queries/list-active-organization-memberships-for-account.handler";
import { ListActiveOrganizationMembershipsForOrganizationHandler } from "../application/queries/list-active-organization-memberships-for-organization.handler";
import { ListOrganizationInvitationsForOrganizationHandler } from "../application/queries/list-organization-invitations-for-organization.handler";
import { ListPendingOrganizationInvitationsForAccountHandler } from "../application/queries/list-pending-organization-invitations-for-account.handler";
import { OrganizationMembershipService } from "../application/services/organization-membership.service";
import type {
  OrganizationContextEligibilityResult,
  OrganizationMembershipReference,
} from "../contracts/organization-membership-reference";

export interface OrganizationMembershipsServerFacade {
  acceptOrganizationInvitation: AcceptOrganizationInvitationUseCase["acceptOrganizationInvitation"];
  cancelOrganizationInvitation: CancelOrganizationInvitationUseCase["cancelOrganizationInvitation"];
  changeOrganizationMemberRole: ChangeOrganizationMemberRoleUseCase["changeOrganizationMemberRole"];
  checkOrganizationContextEligibility: (input: {
    accountId: string;
    organizationId: string;
  }) => Promise<OrganizationContextEligibilityResult>;
  declineOrganizationInvitation: DeclineOrganizationInvitationUseCase["declineOrganizationInvitation"];
  inviteOrganizationMember: InviteOrganizationMemberUseCase["inviteOrganizationMember"];
  listActiveOrganizationMembershipsForAccount: (
    accountId: string,
  ) => Promise<readonly OrganizationMembershipReference[]>;
  listActiveOrganizationMembershipsForOrganization: (
    organizationId: string,
  ) => Promise<readonly OrganizationMembershipReference[]>;
  listOrganizationInvitationsForOrganization: ListOrganizationInvitationsForOrganizationUseCase["listOrganizationInvitationsForOrganization"];
  listPendingOrganizationInvitationsForAccount: ListPendingOrganizationInvitationsForAccountUseCase["listPendingOrganizationInvitationsForAccount"];
  removeOrganizationMember: RemoveOrganizationMemberUseCase["removeOrganizationMember"];
  updateOrganizationInvitation: UpdateOrganizationInvitationUseCase["updateOrganizationInvitation"];
}

function composeOrganizationMembershipsServerFacade(): OrganizationMembershipsServerFacade {
  const repository = new InMemoryOrganizationMembershipAdapter();
  const service = new OrganizationMembershipService(
    repository,
    new OrganizationInvitationAccountAdapter(),
    new InMemoryOrganizationMembershipIdGeneratorAdapter(),
    new SystemOrganizationMembershipClockAdapter(),
  );
  const acceptInvitation =
    new AcceptOrganizationInvitationHandler(service);
  const cancelInvitation =
    new CancelOrganizationInvitationHandler(service);
  const changeMemberRole =
    new ChangeOrganizationMemberRoleHandler(service);
  const checkEligibility =
    new CheckOrganizationContextEligibilityHandler(repository);
  const declineInvitation =
    new DeclineOrganizationInvitationHandler(service);
  const inviteMember = new InviteOrganizationMemberHandler(service);
  const listActive =
    new ListActiveOrganizationMembershipsForAccountHandler(repository);
  const listByOrganization =
    new ListActiveOrganizationMembershipsForOrganizationHandler(repository);
  const listInvitations =
    new ListOrganizationInvitationsForOrganizationHandler(service);
  const listPendingInvitations =
    new ListPendingOrganizationInvitationsForAccountHandler(service);
  const removeMember = new RemoveOrganizationMemberHandler(service);
  const updateInvitation =
    new UpdateOrganizationInvitationHandler(service);

  return {
    acceptOrganizationInvitation: (command) =>
      acceptInvitation.acceptOrganizationInvitation(command),
    cancelOrganizationInvitation: (command) =>
      cancelInvitation.cancelOrganizationInvitation(command),
    changeOrganizationMemberRole: (command) =>
      changeMemberRole.changeOrganizationMemberRole(command),
    checkOrganizationContextEligibility: (input) =>
      checkEligibility.checkOrganizationContextEligibility(input),
    declineOrganizationInvitation: (command) =>
      declineInvitation.declineOrganizationInvitation(command),
    inviteOrganizationMember: (command) =>
      inviteMember.inviteOrganizationMember(command),
    listActiveOrganizationMembershipsForAccount: (accountId) =>
      listActive.listActiveOrganizationMembershipsForAccount({ accountId }),
    listActiveOrganizationMembershipsForOrganization: (organizationId) =>
      listByOrganization.listActiveOrganizationMembershipsForOrganization({
        organizationId,
      }),
    listOrganizationInvitationsForOrganization: (query) =>
      listInvitations.listOrganizationInvitationsForOrganization(query),
    listPendingOrganizationInvitationsForAccount: (query) =>
      listPendingInvitations.listPendingOrganizationInvitationsForAccount(
        query,
      ),
    removeOrganizationMember: (command) =>
      removeMember.removeOrganizationMember(command),
    updateOrganizationInvitation: (command) =>
      updateInvitation.updateOrganizationInvitation(command),
  };
}

export const organizationMembershipsServerFacade =
  composeOrganizationMembershipsServerFacade();
