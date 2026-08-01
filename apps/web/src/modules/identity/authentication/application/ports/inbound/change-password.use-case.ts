export type ChangePasswordCommand = Readonly<{
  accountId: string;
  currentPassword: string;
  isSudoMode: boolean;
  newPassword: string;
}>;

export type ChangePasswordResult = Readonly<{
  status:
    | "changed"
    | "credential-not-found"
    | "invalid-current-password"
    | "invalid-password"
    | "password-reused"
    | "sensitive-action-required";
}>;

export interface ChangePasswordUseCase {
  changePassword(
    command: ChangePasswordCommand,
  ): Promise<ChangePasswordResult>;
}
