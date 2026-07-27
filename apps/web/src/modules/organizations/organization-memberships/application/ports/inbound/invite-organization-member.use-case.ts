import type {
  OrganizationInvitationSnapshot,
  OrganizationMembershipQuerySnapshot,
} from "../outbound/organization-membership-query.repository.port";

export type InviteOrganizationMemberCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  username: string;
  role: string;
}>;

export type InviteOrganizationMemberResult =
  | Readonly<{
      status: "invited";
      invitation: OrganizationInvitationSnapshot;
      membership: OrganizationMembershipQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "account-not-found"
        | "already-member"
        | "invalid-role"
        | "invitation-already-pending"
        | "managed-account-requires-scim"
        | "permission-denied";
    }>;

export interface InviteOrganizationMemberUseCase {
  inviteOrganizationMember(
    command: InviteOrganizationMemberCommand,
  ): Promise<InviteOrganizationMemberResult>;
}
