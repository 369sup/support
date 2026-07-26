import type {
  EnterpriseTeamMemberAccount,
  EnterpriseTeamMembershipReference,
} from "../../../domain/enterprise-team";

export type AddEnterpriseTeamMemberCommand = Readonly<{
  actorAccountId: string;
  enterpriseSlug: string;
  teamId: string;
  username: string;
}>;

export type AddEnterpriseTeamMemberResult =
  | Readonly<{
      status: "added";
      membership: EnterpriseTeamMembershipReference;
      account: EnterpriseTeamMemberAccount;
    }>
  | Readonly<{
      status:
        | "account-not-found"
        | "already-team-member"
        | "enterprise-not-found"
        | "permission-denied"
        | "team-member-limit-reached"
        | "team-not-found";
    }>;

export interface AddEnterpriseTeamMemberUseCase {
  addEnterpriseTeamMember(
    command: AddEnterpriseTeamMemberCommand,
  ): Promise<AddEnterpriseTeamMemberResult>;
}
