import type { OrganizationInvitationSnapshot } from "../outbound/organization-membership-query.repository.port";

export type CancelOrganizationInvitationCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  invitationId: string;
}>;

export type CancelOrganizationInvitationResult =
  | Readonly<{
      status: "canceled";
      invitation: OrganizationInvitationSnapshot;
    }>
  | Readonly<{
      status:
        | "invitation-not-found"
        | "invitation-not-pending"
        | "permission-denied";
    }>;

export interface CancelOrganizationInvitationUseCase {
  cancelOrganizationInvitation(
    command: CancelOrganizationInvitationCommand,
  ): Promise<CancelOrganizationInvitationResult>;
}
