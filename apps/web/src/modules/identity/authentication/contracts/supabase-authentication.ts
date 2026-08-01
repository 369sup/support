import type { AuthenticatedSessionReference } from "./authenticated-session-reference";

export type SupabasePasswordSignInResult =
  | Readonly<{
      status: "created";
      session: AuthenticatedSessionReference;
    }>
  | Readonly<{
      status: "invalid-credentials" | "service-unavailable";
    }>;

export type SupabasePasswordSignUpResult =
  | Readonly<{
      status: "created";
      session: AuthenticatedSessionReference;
    }>
  | Readonly<{ status: "confirmation-required" }>
  | Readonly<{
      status:
        | "invalid-registration"
        | "service-unavailable"
        | "username-conflict";
    }>;

export type SupabaseConfirmationResult =
  | Readonly<{ status: "confirmed" }>
  | Readonly<{ status: "invalid-confirmation" | "service-unavailable" }>;

export type ExternalAuthenticationProvider = "google";

export type ExternalSignInStartResult =
  | Readonly<{
      redirectUrl:
        | `http://127.0.0.1${string}`
        | `http://localhost${string}`
        | `https://${string}`;
      status: "redirect";
    }>
  | Readonly<{ status: "service-unavailable" }>;

export type ExternalSignInCompletionResult =
  | Readonly<{
      session: AuthenticatedSessionReference;
      status: "authenticated";
    }>
  | Readonly<{
      email: string;
      status: "onboarding-required";
    }>
  | Readonly<{
      status: "invalid-callback" | "service-unavailable";
    }>;

export type ExternalAccountProvisioningState =
  | Readonly<{ status: "authenticated" }>
  | Readonly<{
      email: string;
      status: "required";
    }>
  | Readonly<{ status: "unavailable" }>;

export type ExternalAccountProvisioningResult = Readonly<{
  status:
    | "account-conflict"
    | "created"
    | "invalid-username"
    | "service-unavailable"
    | "username-conflict";
}>;
