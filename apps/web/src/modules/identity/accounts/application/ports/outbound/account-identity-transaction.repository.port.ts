import type { AccountQuerySnapshot } from "./account-query.repository.port";

export type AccountIdentityTransactionCommand =
  | Readonly<{
      action: "prepare-registration";
      transactionId: string;
      account: AccountQuerySnapshot;
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

export type AccountIdentityTransactionResult =
  | Readonly<{
      status: "committed" | "finalized" | "prepared" | "rolled-back";
      account: AccountQuerySnapshot;
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

export interface AccountIdentityTransactionRepositoryPort {
  apply(
    command: AccountIdentityTransactionCommand,
  ): Promise<AccountIdentityTransactionResult>;
}
