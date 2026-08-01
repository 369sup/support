export type ConfigureTotpCommand =
  | Readonly<{
      action: "begin";
      accountId: string;
      username: string;
    }>
  | Readonly<{
      action: "confirm";
      accountId: string;
      token: string;
    }>;

export type ConfigureTotpResult =
  | Readonly<{
      status: "enrollment-started";
      provisioningUri: string;
      secret: string;
    }>
  | Readonly<{
      status: "enabled";
      recoveryCodes: readonly string[];
    }>
  | Readonly<{
      status:
        | "configuration-not-found"
        | "invalid-account"
        | "invalid-token"
        | "token-reused";
    }>;

export interface ConfigureTotpUseCase {
  configureTotp(
    command: ConfigureTotpCommand,
  ): Promise<ConfigureTotpResult>;
}
