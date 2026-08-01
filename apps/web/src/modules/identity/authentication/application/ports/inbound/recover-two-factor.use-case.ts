export type RecoverTwoFactorCommand =
  | Readonly<{ action: "request"; accountId: string }>
  | Readonly<{
      action: "complete";
      accountId: string;
      requestId: string;
    }>;

export type RecoverTwoFactorResult =
  | Readonly<{
      status: "recovery-requested";
      availableAt: string;
      requestId: string;
    }>
  | Readonly<{ status: "recovered" }>
  | Readonly<{
      status:
        | "configuration-not-found"
        | "hold-active"
        | "invalid-request"
        | "request-not-found";
    }>;

export interface RecoverTwoFactorUseCase {
  recoverTwoFactor(
    command: RecoverTwoFactorCommand,
  ): Promise<RecoverTwoFactorResult>;
}
