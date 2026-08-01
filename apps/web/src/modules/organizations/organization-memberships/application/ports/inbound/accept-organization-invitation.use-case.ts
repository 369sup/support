import type {
  OrganizationInvitationSnapshot,
  OrganizationMembershipQuerySnapshot,
} from "../outbound/organization-membership-query.repository.port";

export type AcceptOrganizationInvitationCommand = Readonly<{
  actorAccountId: string;
  invitationId: string;
}>;

export type AcceptOrganizationInvitationResult =
  | Readonly<{
      status: "accepted";
      invitation: OrganizationInvitationSnapshot;
      membership: OrganizationMembershipQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "already-member"
        | "invitation-expired"
        | "invitation-not-for-actor"
        | "invitation-not-found"
        | "invitation-not-pending";
    }>;

export interface AcceptOrganizationInvitationUseCase {
  acceptOrganizationInvitation(
    command: AcceptOrganizationInvitationCommand,
  ): Promise<AcceptOrganizationInvitationResult>;
}
