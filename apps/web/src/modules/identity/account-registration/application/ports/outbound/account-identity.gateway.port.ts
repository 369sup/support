export type AccountIdentityStep =
  | Readonly<{
      action: "prepare-registration";
      transactionId: string;
      account: Readonly<{
        accountId: string;
        username: string;
        displayName: string;
        accountType: "personal";
        usage: "human";
        lifecycleState: "pending";
      }>;
    }>
  | Readonly<{
      action: "prepare-username-change";
      transactionId: string;
      actorAccountId: string;
      accountId: string;
      newUsername: string;
    }>
  | Readonly<{
      action: "commit" | "finalize" | "rollback";
      transactionId: string;
    }>;

export type AccountIdentityStepResult =
  | Readonly<{
      status: "committed" | "finalized" | "prepared" | "rolled-back";
      account: Readonly<{
        accountId: string;
        username: string;
        accountType: "personal" | "managed";
        usage: "human" | "machine";
        lifecycleState: "pending" | "active" | "suspended" | "deleted";
      }>;
    }>
  | Readonly<{
      status:
        | "account-not-found"
        | "invalid-account"
        | "permission-denied"
        | "transaction-not-found"
        | "unsupported-account-type"
        | "username-conflict";
    }>;

export interface AccountIdentityGatewayPort {
  apply(step: AccountIdentityStep): Promise<AccountIdentityStepResult>;
}
