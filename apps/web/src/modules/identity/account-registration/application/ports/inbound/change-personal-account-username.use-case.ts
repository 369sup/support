export type ChangePersonalAccountUsernameCommand = Readonly<{
  actorAccountId: string;
  accountId: string;
  newUsername: string;
}>;

export type ChangePersonalAccountUsernameResult =
  | Readonly<{
      status: "changed";
      account: Readonly<{ accountId: string; username: string }>;
    }>
  | Readonly<{
      status:
        | "account-not-found"
        | "credential-unavailable"
        | "invalid-username"
        | "permission-denied"
        | "transaction-failed"
        | "unsupported-account-type"
        | "username-conflict";
    }>;

export interface ChangePersonalAccountUsernameUseCase {
  changePersonalAccountUsername(
    command: ChangePersonalAccountUsernameCommand,
  ): Promise<ChangePersonalAccountUsernameResult>;
}
