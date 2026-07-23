import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type ReauthenticateSessionCommand = Readonly<{
  browserToken: string;
  sessionId: string;
  password: string;
}>;
export type ReauthenticateSessionResult =
  | Readonly<{
      status: "reauthenticated";
      session: ResolvedAccountSessionSnapshot;
    }>
  | Readonly<{
      status:
        | "browser-session-not-found"
        | "session-not-found"
        | "invalid-credentials"
        | "account-unavailable";
    }>;

export interface ReauthenticateSessionUseCase {
  reauthenticateSession(
    command: ReauthenticateSessionCommand,
  ): Promise<ReauthenticateSessionResult>;
}
