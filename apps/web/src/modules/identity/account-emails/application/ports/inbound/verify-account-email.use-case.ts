export type VerifyAccountEmailCommand =
  | Readonly<{
      action: "request";
      accountId: string;
      emailId: string;
    }>
  | Readonly<{
      action: "confirm";
      token: string;
    }>;

export type VerifyAccountEmailResult = Readonly<{
  status:
    | "delivery-failed"
    | "email-not-found"
    | "invalid-token"
    | "verification-expired"
    | "verification-sent"
    | "verified";
}>;

export interface VerifyAccountEmailUseCase {
  verifyAccountEmail(
    command: VerifyAccountEmailCommand,
  ): Promise<VerifyAccountEmailResult>;
}
