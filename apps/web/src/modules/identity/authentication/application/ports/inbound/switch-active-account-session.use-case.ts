import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type SwitchActiveAccountSessionCommand = Readonly<{
  browserToken: string;
  sessionId: string;
}>;
export type SwitchActiveAccountSessionResult =
  | Readonly<{
      status: "switched";
      session: ResolvedAccountSessionSnapshot;
    }>
  | Readonly<{
      status:
        | "browser-session-not-found"
        | "session-not-found"
        | "session-not-switchable";
    }>
  | Readonly<{
      status: "reauthentication-required";
      sessionId: string;
      accountId: string;
    }>;

export interface SwitchActiveAccountSessionUseCase {
  switchActiveAccountSession(
    command: SwitchActiveAccountSessionCommand,
  ): Promise<SwitchActiveAccountSessionResult>;
}
