export type ResetPasswordCommand = Readonly<{
  newPassword: string;
  token: string;
}>;

export type ResetPasswordResult = Readonly<{
  status:
    | "invalid-password"
    | "invalid-reset-token"
    | "password-reused"
    | "reset"
    | "reset-token-expired";
}>;

export interface ResetPasswordUseCase {
  resetPassword(
    command: ResetPasswordCommand,
  ): Promise<ResetPasswordResult>;
}
