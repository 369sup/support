export type VerifyAdditionalFactorCommand = Readonly<{
  accountId: string;
  factor:
    | Readonly<{ kind: "recovery-code"; code: string }>
    | Readonly<{ kind: "totp"; token: string }>;
}>;

export type VerifyAdditionalFactorResult = Readonly<{
  status:
    | "configuration-not-found"
    | "factor-not-required"
    | "invalid-factor"
    | "verified";
}>;

export interface VerifyAdditionalFactorUseCase {
  verifyAdditionalFactor(
    command: VerifyAdditionalFactorCommand,
  ): Promise<VerifyAdditionalFactorResult>;
}
