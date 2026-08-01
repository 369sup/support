export type EnterpriseAffiliation = Readonly<{
  membershipId: string;
  enterpriseId: string;
  accountId: string;
  affiliation: "direct" | "organization-derived";
  state: "active" | "pending" | "suspended" | "removed";
}>;
