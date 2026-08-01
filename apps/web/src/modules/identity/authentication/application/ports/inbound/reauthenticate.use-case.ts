export type ReauthenticateResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{
      status:
        | "invalid-factor"
        | "invalid-verification"
        | "service-unavailable";
    }>;

export interface ReauthenticateUseCase {
  reauthenticate(): Promise<ReauthenticateResult>;
}
