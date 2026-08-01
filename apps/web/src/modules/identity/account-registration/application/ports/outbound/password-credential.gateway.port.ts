export type PasswordCredentialStep =
  | Readonly<{
      action: "prepare-registration";
      transactionId: string;
      accountId: string;
      username: string;
      password: string;
    }>
  | Readonly<{
      action: "prepare-username-change";
      transactionId: string;
      accountId: string;
      newUsername: string;
    }>
  | Readonly<{
      action: "commit" | "finalize" | "rollback";
      transactionId: string;
    }>;

export type PasswordCredentialStepResult =
  | Readonly<{
      status: "committed" | "finalized" | "prepared" | "rolled-back";
      accountId: string;
      username: string;
    }>
  | Readonly<{
      status:
        | "credential-conflict"
        | "credential-not-found"
        | "password-rejected"
        | "transaction-not-found";
    }>;

export interface PasswordCredentialGatewayPort {
  apply(step: PasswordCredentialStep): Promise<PasswordCredentialStepResult>;
}
