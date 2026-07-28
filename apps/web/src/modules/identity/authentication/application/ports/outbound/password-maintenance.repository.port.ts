export type PasswordMaintenanceResult =
  | Readonly<{
      status: "changed" | "reset";
      accountId: string;
    }>
  | Readonly<{
      status:
        | "credential-not-found"
        | "invalid-current-password"
        | "invalid-reset-token"
        | "password-reused"
        | "reset-token-expired";
    }>;

export interface PasswordMaintenanceRepositoryPort {
  changePassword(input: {
    accountId: string;
    currentPassword: string;
    newPassword: string;
  }): Promise<PasswordMaintenanceResult>;
  issueResetToken(input: {
    accountId: string;
    expiresAt: string;
    tokenHash: string;
  }): Promise<void>;
  resetPassword(input: {
    newPassword: string;
    tokenHash: string;
  }): Promise<PasswordMaintenanceResult>;
}
