import type { AccountQuerySnapshot } from "../outbound/account-query.repository.port";

export type ApplyAccountIdentityTransactionCommand =
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

export type ApplyAccountIdentityTransactionResult =
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

export interface ApplyAccountIdentityTransactionUseCase {
  applyAccountIdentityTransaction(
    command: ApplyAccountIdentityTransactionCommand,
  ): Promise<ApplyAccountIdentityTransactionResult>;
}
