export type PasswordCredentialTransaction = Readonly<{
  transactionId: string;
  phase: "prepared" | "committed" | "finalized" | "rolled-back";
  subject: "registration" | "username-change";
}>;
