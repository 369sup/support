import type { OrganizationInvitationSnapshot } from "../outbound/organization-membership-query.repository.port";

export type DeclineOrganizationInvitationCommand = Readonly<{
  actorAccountId: string;
  invitationId: string;
}>;

export type DeclineOrganizationInvitationResult =
  | Readonly<{
      status: "declined";
      invitation: OrganizationInvitationSnapshot;
    }>
  | Readonly<{
      status:
        | "invitation-expired"
        | "invitation-not-for-actor"
        | "invitation-not-found"
        | "invitation-not-pending";
    }>;

export interface DeclineOrganizationInvitationUseCase {
  declineOrganizationInvitation(
    command: DeclineOrganizationInvitationCommand,
  ): Promise<DeclineOrganizationInvitationResult>;
}
