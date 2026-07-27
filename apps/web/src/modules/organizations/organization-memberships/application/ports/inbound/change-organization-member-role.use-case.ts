import type { OrganizationMembershipQuerySnapshot } from "../outbound/organization-membership-query.repository.port";

export type ChangeOrganizationMemberRoleCommand = Readonly<{
  actorAccountId: string;
  organizationId: string;
  membershipId: string;
  role: string;
}>;

export type ChangeOrganizationMemberRoleResult =
  | Readonly<{
      status: "changed";
      membership: OrganizationMembershipQuerySnapshot;
    }>
  | Readonly<{
      status:
        | "invalid-role"
        | "last-owner-protected"
        | "membership-managed-externally"
        | "membership-not-found"
        | "permission-denied";
    }>;

export interface ChangeOrganizationMemberRoleUseCase {
  changeOrganizationMemberRole(
    command: ChangeOrganizationMemberRoleCommand,
  ): Promise<ChangeOrganizationMemberRoleResult>;
}
