import type { OrganizationInvitationSnapshot } from "../outbound/organization-membership-query.repository.port";

export type UpdateOrganizationInvitationCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  invitationId: string;
  role: string;
}>;

export type UpdateOrganizationInvitationResult =
  | Readonly<{
      status: "updated";
      invitation: OrganizationInvitationSnapshot;
    }>
  | Readonly<{
      status:
        | "invalid-role"
        | "invitation-expired"
        | "invitation-not-found"
        | "invitation-not-pending"
        | "permission-denied";
    }>;

export interface UpdateOrganizationInvitationUseCase {
  updateOrganizationInvitation(
    command: UpdateOrganizationInvitationCommand,
  ): Promise<UpdateOrganizationInvitationResult>;
}
