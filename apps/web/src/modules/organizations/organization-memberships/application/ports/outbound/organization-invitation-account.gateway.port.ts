export type OrganizationInvitationAccountSnapshot = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
  usage: "human" | "machine";
}>;

export interface OrganizationInvitationAccountGatewayPort {
  getActiveAccountByEmail(
    email: string,
  ): Promise<OrganizationInvitationAccountSnapshot | null>;
  getActiveAccountByUsername(
    username: string,
  ): Promise<OrganizationInvitationAccountSnapshot | null>;
}
