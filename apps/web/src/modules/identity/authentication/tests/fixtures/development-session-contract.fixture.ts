import type { ResolvedAccountSessionSnapshot } from "../../application/authenticated-session-snapshot";

// Test-only contract for the isolated development credential fixture.

export type CreateDevelopmentSessionCommand = Readonly<{
  browserToken: string | null;
  username: string;
  password: string;
  secondFactor?:
    | Readonly<{ kind: "recovery-code"; code: string }>
    | Readonly<{ kind: "totp"; token: string }>;
}>;
export type CreateDevelopmentSessionResult =
  | Readonly<{
      status: "created";
      browserToken: string;
      session: ResolvedAccountSessionSnapshot;
    }>
  | Readonly<{
      status:
        | "account-unavailable"
        | "additional-factor-required"
        | "invalid-additional-factor"
        | "invalid-credentials";
    }>;

export interface CreateDevelopmentSessionUseCase {
  createDevelopmentSession(
    command: CreateDevelopmentSessionCommand,
  ): Promise<CreateDevelopmentSessionResult>;
}
