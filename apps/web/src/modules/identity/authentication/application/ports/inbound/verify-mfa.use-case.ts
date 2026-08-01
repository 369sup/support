export type VerifyMfaResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{
      status:
        | "invalid-factor"
        | "invalid-verification"
        | "service-unavailable";
    }>;

export interface VerifyMfaUseCase {
  verifyMfa(input: {
    challengeId: string;
    code: string;
    factorId: string;
  }): Promise<VerifyMfaResult>;
}
