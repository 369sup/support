import type { ResolvedAccountSessionSnapshot } from "../../authenticated-session-snapshot";

export type CreateDevelopmentSessionCommand = Readonly<{
  browserToken: string | null;
  username: string;
  password: string;
}>;
export type CreateDevelopmentSessionResult =
  | Readonly<{
      status: "created";
      browserToken: string;
      session: ResolvedAccountSessionSnapshot;
    }>
  | Readonly<{
      status: "invalid-credentials" | "account-unavailable";
    }>;

export interface CreateDevelopmentSessionUseCase {
  createDevelopmentSession(
    command: CreateDevelopmentSessionCommand,
  ): Promise<CreateDevelopmentSessionResult>;
}
