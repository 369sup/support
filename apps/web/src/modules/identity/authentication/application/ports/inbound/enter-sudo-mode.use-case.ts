export type EnterSudoModeCommand = Readonly<{
  accountId: string;
  factor:
    | Readonly<{ kind: "recovery-code"; code: string }>
    | Readonly<{ kind: "totp"; token: string }>;
}>;

export type EnterSudoModeResult =
  | Readonly<{ status: "entered"; sudoUntil: string }>
  | Readonly<{
      status: "configuration-not-found" | "invalid-factor";
    }>;

export interface EnterSudoModeUseCase {
  enterSudoMode(
    command: EnterSudoModeCommand,
  ): Promise<EnterSudoModeResult>;
}
