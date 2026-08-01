export type OrganizationInvitationAccountSnapshot = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
  usage: "human" | "machine";
}>;

export interface OrganizationInvitationAccountGatewayPort {
  getActiveAccountByUsername(
    username: string,
  ): Promise<OrganizationInvitationAccountSnapshot | null>;
}
