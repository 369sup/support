export type ExpireSessionCommand = Readonly<{
  browserToken: string;
  sessionId: string;
}>;
export type ExpireSessionResult =
  | Readonly<{ status: "expired" }>
  | Readonly<{
      status: "browser-session-not-found" | "session-not-found";
    }>;

export interface ExpireSessionUseCase {
  expireSession(command: ExpireSessionCommand): Promise<ExpireSessionResult>;
}
