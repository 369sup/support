import type { EnterpriseTeamMembershipReference } from "../../../domain/enterprise-team";

export type RemoveEnterpriseTeamMemberCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
  accountId: string;
}>;

export type RemoveEnterpriseTeamMemberResult =
  | Readonly<{
      status: "removed";
      membership: EnterpriseTeamMembershipReference;
    }>
  | Readonly<{
      status:
        | "enterprise-not-found"
        | "membership-not-found"
        | "permission-denied"
        | "team-not-found";
    }>;

export interface RemoveEnterpriseTeamMemberUseCase {
  removeEnterpriseTeamMember(
    command: RemoveEnterpriseTeamMemberCommand,
  ): Promise<RemoveEnterpriseTeamMemberResult>;
}
