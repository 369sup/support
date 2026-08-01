import type { AccountReference } from "@/modules/identity/accounts/integration-contracts";

export type AuthenticatedSessionReference = Readonly<{
  sessionId: string;
  account: AccountReference;
  status: "active" | "expired" | "revoked";
  authenticatedAt: string;
  expiresAt: string | null;
}>;

export type BrowserAccountSessionView = AuthenticatedSessionReference &
  Readonly<{ isCurrent: boolean }>;

export type ListBrowserAccountSessionsResult =
  | Readonly<{
      status: "found";
      sessions: readonly BrowserAccountSessionView[];
    }>
  | Readonly<{ status: "browser-session-not-found" }>;

export type CurrentSessionResult =
  | Readonly<{
      status: "authenticated";
      session: AuthenticatedSessionReference;
    }>
  | Readonly<{ status: "authentication-required" }>;

export type CreateDevelopmentSessionResult =
  | Readonly<{
      status: "created";
      browserToken: string;
      session: AuthenticatedSessionReference;
    }>
  | Readonly<{
      status: "invalid-credentials" | "account-unavailable";
    }>;

export type SwitchAccountSessionResult =
  | Readonly<{
      status: "switched";
      session: AuthenticatedSessionReference;
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

export type RemoveAccountSessionResult =
  | Readonly<{
      status: "removed";
      currentSession: AuthenticatedSessionReference | null;
      isBrowserSessionEmpty: boolean;
    }>
  | Readonly<{
      status: "browser-session-not-found" | "session-not-found";
    }>;

export type ReauthenticateSessionResult =
  | Readonly<{
      status: "reauthenticated";
      session: AuthenticatedSessionReference;
    }>
  | Readonly<{
      status:
        | "browser-session-not-found"
        | "session-not-found"
        | "invalid-credentials"
        | "account-unavailable";
    }>;

export type ExpireSessionResult =
  | Readonly<{ status: "expired" }>
  | Readonly<{
      status: "browser-session-not-found" | "session-not-found";
    }>;
