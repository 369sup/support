import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type GetCurrentAuthenticatedSessionQuery = Readonly<{
  browserToken: string;
}>;
export type GetCurrentAuthenticatedSessionResult =
  | Readonly<{
      status: "authenticated";
      session: ResolvedAccountSessionSnapshot;
    }>
  | Readonly<{ status: "authentication-required" }>;

export interface GetCurrentAuthenticatedSessionUseCase {
  getCurrentAuthenticatedSession(
    query: GetCurrentAuthenticatedSessionQuery,
  ): Promise<GetCurrentAuthenticatedSessionResult>;
}
