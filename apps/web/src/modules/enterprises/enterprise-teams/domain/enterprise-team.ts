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

export function createEnterpriseTeamSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
