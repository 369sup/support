import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type RemoveOrganizationMemberCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  membershipId: string;
}>;

export type RemoveOrganizationMemberResult =
  | Readonly<{
      status: "removed";
      membership: OrganizationMembershipQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "last-owner-protected"
        | "membership-managed-externally"
        | "membership-not-found"
        | "permission-denied";
    }>;

export interface RemoveOrganizationMemberUseCase {
  removeOrganizationMember(
    command: RemoveOrganizationMemberCommand,
  ): Promise<RemoveOrganizationMemberResult>;
}
