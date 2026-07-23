export type EnterpriseMembershipQuerySnapshot = Readonly<{
  membershipId: string;
  enterpriseId: string;
  accountId: string;
  affiliation: "direct" | "organization-derived";
  state: "active" | "pending" | "suspended" | "removed";
}>;

export interface EnterpriseMembershipQueryRepositoryPort {
  findByAccountId(
    accountId: string,
  ): Promise<readonly EnterpriseMembershipQuerySnapshot[]>;
}
