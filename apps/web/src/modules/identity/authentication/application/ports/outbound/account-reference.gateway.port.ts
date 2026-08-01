export type AuthenticationAccountSnapshot = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
  usage: "human" | "machine";
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export interface AccountReferenceGatewayPort {
  getAccountReference(
    accountId: string,
  ): Promise<AuthenticationAccountSnapshot | null>;
}
