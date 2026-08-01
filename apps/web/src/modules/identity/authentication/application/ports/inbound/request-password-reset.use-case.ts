export type RequestPasswordResetCommand = Readonly<{
  accountId: string;
  address: string;
}>;

export type RequestPasswordResetResult = Readonly<{
  status: "delivery-failed" | "invalid-request" | "reset-requested";
}>;

export interface RequestPasswordResetUseCase {
  requestPasswordReset(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult>;
}
