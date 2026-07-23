import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type RemoveAccountSessionCommand = Readonly<{
  browserToken: string;
  sessionId: string;
}>;
export type RemoveAccountSessionResult =
  | Readonly<{
      status: "removed";
      currentSession: ResolvedAccountSessionSnapshot | null;
      browserSessionEmpty: boolean;
    }>
  | Readonly<{
      status: "browser-session-not-found" | "session-not-found";
    }>;

export interface RemoveAccountSessionUseCase {
  removeAccountSession(
    command: RemoveAccountSessionCommand,
  ): Promise<RemoveAccountSessionResult>;
}
