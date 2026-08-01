export type ManagePasskeyCommand =
  | Readonly<{
      action: "begin-registration";
      accountId: string;
      username: string;
    }>
  | Readonly<{
      action: "complete-registration";
      accountId: string;
      challengeId: string;
      response: unknown;
    }>
  | Readonly<{
      action: "begin-authentication";
      accountId: string;
    }>
  | Readonly<{
      action: "complete-authentication";
      accountId: string;
      challengeId: string;
      response: unknown;
    }>;

export type ManagePasskeyResult =
  | Readonly<{
      status: "options-created";
      challengeId: string;
      options: unknown;
    }>
  | Readonly<{
      status: "passkey-registered" | "verified";
      credentialId: string;
    }>
  | Readonly<{
      status:
        | "challenge-expired"
        | "challenge-not-found"
        | "invalid-account"
        | "invalid-response"
        | "passkey-not-found";
    }>;

export interface ManagePasskeyUseCase {
  managePasskey(
    command: ManagePasskeyCommand,
  ): Promise<ManagePasskeyResult>;
}
