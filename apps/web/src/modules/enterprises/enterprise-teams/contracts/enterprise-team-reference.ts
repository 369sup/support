export type EnterpriseTeamReference = Readonly<{
  teamId: string;
  enterpriseId: string;
  name: string;
  slug: string;
  description: string;
  lifecycleState: "active" | "deleted";
}>;

export type EnterpriseTeamMembershipReference = Readonly<{
  teamMembershipId: string;
  teamId: string;
  enterpriseId: string;
  accountId: string;
  state: "active" | "removed";
}>;

export type EnterpriseTeamMemberAccount = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
}>;

export type EnterpriseTeamMemberView = Readonly<{
  membership: EnterpriseTeamMembershipReference;
  account: EnterpriseTeamMemberAccount;
}>;
