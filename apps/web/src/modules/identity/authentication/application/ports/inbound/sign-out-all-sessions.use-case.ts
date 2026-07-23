export type SignOutAllSessionsCommand = Readonly<{ browserToken: string }>;
export type SignOutAllSessionsResult =
  | Readonly<{ status: "signed-out" }>
  | Readonly<{ status: "browser-session-not-found" }>;

export interface SignOutAllSessionsUseCase {
  signOutAllSessions(
    command: SignOutAllSessionsCommand,
  ): Promise<SignOutAllSessionsResult>;
}
