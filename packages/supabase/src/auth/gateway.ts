import type {
  AuthError,
  JwtPayload,
  User,
} from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

import {
  resolveSupabaseAuthConfiguration,
  type SupabaseAuthRuntimeConfiguration,
} from "./configuration";

export type SupabaseOAuthProvider = "google";
export type SupabaseOAuthRedirectUrl =
  | `http://127.0.0.1${string}`
  | `http://localhost${string}`
  | `https://${string}`;

export type SupabaseEmailOtpType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

export type SupabaseCookie = Readonly<{
  name: string;
  options: CookieOptions;
  value: string;
}>;

export interface SupabaseCookieBridge {
  getAll:
    | (() =>
        | Promise<readonly Readonly<{ name: string; value: string }>[] | null>
        | readonly Readonly<{ name: string; value: string }>[]
        | null);
  setAll: (
    cookies: readonly SupabaseCookie[],
    headers: Readonly<Record<string, string>>,
  ) => Promise<void> | void;
}

export type SupabaseAuthFailure = Readonly<{
  code: string;
  status: number | null;
}>;

export type SupabaseAuthResult<T> =
  | Readonly<{ data: T; error: null }>
  | Readonly<{ data: null; error: SupabaseAuthFailure }>;

export type SupabaseAuthClaims = Readonly<{
  aal: "aal1" | "aal2" | null;
  expiresAt: number | null;
  issuedAt: number | null;
  sessionId: string | null;
  subject: string;
}>;

export type SupabaseMfaFactor = Readonly<{
  createdAt: string;
  factorId: string;
  friendlyName: string | null;
  status: "unverified" | "verified";
  updatedAt: string;
}>;

export type SupabaseMfaEnrollment = Readonly<{
  factorId: string;
  friendlyName: string | null;
  qrCode: string;
  secret: string;
  uri: string;
}>;

export type SupabaseMfaChallenge = Readonly<{
  challengeId: string;
  expiresAt: number;
}>;

export type SupabaseAuthenticatorAssurance = Readonly<{
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
}>;

export type SupabaseAuthUser = Readonly<{
  email: string | null;
  emailVerifiedAt: string | null;
  providers: readonly string[];
  subject: string;
  userMetadata: Readonly<Record<string, unknown>>;
}>;

export type SupabaseSignUpResult = Readonly<{
  claims: SupabaseAuthClaims | null;
  user: SupabaseAuthUser;
}>;

type SupabaseAuthenticatedResult = Readonly<{
  claims: SupabaseAuthClaims;
  user: SupabaseAuthUser;
}>;

type SupabaseOAuthStartResult = Readonly<{
  flowId: string | null;
  provider: SupabaseOAuthProvider;
  redirectUrl: SupabaseOAuthRedirectUrl;
}>;

type SupabaseConfirmationResult = Readonly<{
  user: SupabaseAuthUser | null;
}>;

export interface SupabaseAuthGateway {
  challengeMfa: (
    factorId: string,
  ) => Promise<SupabaseAuthResult<SupabaseMfaChallenge>>;
  enrollTotp: (
    friendlyName?: string,
  ) => Promise<SupabaseAuthResult<SupabaseMfaEnrollment>>;
  exchangeCodeForSession: (
    code: string,
    flowId?: string,
  ) => Promise<SupabaseAuthResult<SupabaseAuthenticatedResult>>;
  getClaims: () => Promise<SupabaseAuthResult<SupabaseAuthClaims>>;
  getCurrentUser: () => Promise<SupabaseAuthResult<SupabaseAuthUser>>;
  getAuthenticatorAssuranceLevel: () => Promise<
    SupabaseAuthResult<SupabaseAuthenticatorAssurance>
  >;
  listMfaFactors: () => Promise<
    SupabaseAuthResult<readonly SupabaseMfaFactor[]>
  >;
  reauthenticate: () => Promise<SupabaseAuthResult<null>>;
  refreshSession: () => Promise<SupabaseAuthResult<SupabaseAuthClaims>>;
  requestPasswordReset: (input: {
    email: string;
    redirectTo: string;
  }) => Promise<SupabaseAuthResult<null>>;
  signInWithPassword: (input: {
    email: string;
    password: string;
  }) => Promise<SupabaseAuthResult<SupabaseAuthenticatedResult>>;
  signOut: (
    scope: "global" | "local" | "others",
  ) => Promise<SupabaseAuthResult<null>>;
  signUpWithPassword: (input: {
    email: string;
    emailRedirectTo: string;
    password: string;
    username: string;
  }) => Promise<SupabaseAuthResult<SupabaseSignUpResult>>;
  startOAuthSignIn: (input: {
    provider: SupabaseOAuthProvider;
    redirectTo: string;
  }) => Promise<SupabaseAuthResult<SupabaseOAuthStartResult>>;
  updatePassword: (
    password: string,
  ) => Promise<SupabaseAuthResult<SupabaseAuthUser>>;
  updateUserMetadata: (
    metadata: Readonly<Record<string, unknown>>,
  ) => Promise<SupabaseAuthResult<SupabaseAuthUser>>;
  verifyOtp: (input: {
    tokenHash: string;
    type: SupabaseEmailOtpType;
  }) => Promise<SupabaseAuthResult<SupabaseConfirmationResult>>;
  unenrollMfa: (
    factorId: string,
  ) => Promise<SupabaseAuthResult<null>>;
  verifyMfa: (input: {
    challengeId: string;
    code: string;
    factorId: string;
  }) => Promise<SupabaseAuthResult<null>>;
}

function failure(
  code: string,
  status: number | null = null,
): SupabaseAuthResult<never> {
  return { data: null, error: { code, status } };
}

function mapAuthError(
  error: AuthError,
  fallbackCode: string,
): SupabaseAuthFailure {
  return {
    code:
      typeof error.code === "string" && error.code.trim() !== ""
        ? error.code
        : fallbackCode,
    status:
      typeof error.status === "number" && Number.isFinite(error.status)
        ? error.status
        : null,
  };
}

function resultFromError<T>(
  error: AuthError | null,
  fallbackCode: string,
): SupabaseAuthResult<T> | null {
  return error === null
    ? null
    : { data: null, error: mapAuthError(error, fallbackCode) };
}

function normalizeAal(value: unknown): "aal1" | "aal2" | null {
  if (value === "aal1") {
    return "aal1";
  }
  return value === "aal2" ? "aal2" : null;
}

function mapClaims(claims: JwtPayload): SupabaseAuthClaims | null {
  const subject =
    typeof claims.sub === "string" ? claims.sub.trim() : "";
  if (subject === "") {
    return null;
  }
  return {
    aal: normalizeAal(claims.aal),
    expiresAt:
      typeof claims.exp === "number" && Number.isFinite(claims.exp)
        ? claims.exp
        : null,
    issuedAt:
      typeof claims.iat === "number" && Number.isFinite(claims.iat)
        ? claims.iat
        : null,
    sessionId:
      typeof claims.session_id === "string" &&
      claims.session_id.trim() !== ""
        ? claims.session_id
        : null,
    subject,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseRequestUrl(input: Parameters<typeof fetch>[0]): URL | null {
  let value: string;
  if (typeof input === "string") {
    value = input;
  } else if (input instanceof URL) {
    value = input.toString();
  } else {
    value = input.url;
  }
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function createProviderTokenRedactingFetch(
  supabaseUrl: string,
): typeof fetch {
  const upstreamFetch = globalThis.fetch;
  const authBaseUrl = new URL(supabaseUrl);
  const authTokenPath = `${authBaseUrl.pathname.replace(/\/$/u, "")}/auth/v1/token`;

  return async (input, init) => {
    const response = await upstreamFetch(input, init);
    const requestUrl = parseRequestUrl(input);
    if (requestUrl === null) {
      return response;
    }
    if (
      requestUrl.origin !== authBaseUrl.origin ||
      requestUrl.pathname !== authTokenPath ||
      response.headers
        .get("content-type")
        ?.includes("application/json") !== true
    ) {
      return response;
    }
    let payload: unknown;
    try {
      payload = await response.clone().json();
    } catch {
      return response;
    }
    if (
      !isRecord(payload) ||
      (!("provider_token" in payload) &&
        !("provider_refresh_token" in payload))
    ) {
      return response;
    }
    const redactedPayload = { ...payload };
    delete redactedPayload["provider_token"];
    delete redactedPayload["provider_refresh_token"];
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(JSON.stringify(redactedPayload), {
      headers,
      status: response.status,
      statusText: response.statusText,
    });
  };
}

function mapUser(user: User): SupabaseAuthUser {
  let providers: readonly string[] = [];
  if (Array.isArray(user.app_metadata.providers)) {
    providers = user.app_metadata.providers.filter(
        (provider): provider is string =>
          typeof provider === "string" && provider.trim() !== "",
      );
  } else if (typeof user.app_metadata.provider === "string") {
    providers = [user.app_metadata.provider];
  }
  return {
    email:
      typeof user.email === "string" && user.email.trim() !== ""
        ? user.email
        : null,
    emailVerifiedAt:
      typeof user.email_confirmed_at === "string"
        ? user.email_confirmed_at
        : null,
    providers,
    subject: user.id,
    userMetadata: isRecord(user.user_metadata)
      ? user.user_metadata
      : {},
  };
}

function assertRedirectUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Supabase Auth redirect URL is invalid.");
  }
  const isLocalHttp =
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" || url.hostname === "localhost");
  if (url.protocol !== "https:" && !isLocalHttp) {
    throw new Error(
      "Supabase Auth redirect URL must use HTTPS except for local development.",
    );
  }
  if (url.username !== "" || url.password !== "" || url.hash !== "") {
    throw new Error(
      "Supabase Auth redirect URL contains unsupported components.",
    );
  }
  return url.toString();
}

function normalizeRequired(value: string): string | null {
  const normalized = value.trim();
  return normalized === "" ? null : normalized;
}

function isOAuthRedirectUrl(
  value: string,
): value is SupabaseOAuthRedirectUrl {
  return (
    value.startsWith("https://") ||
    value.startsWith("http://localhost") ||
    value.startsWith("http://127.0.0.1")
  );
}

export function createSupabaseAuthGateway(input: {
  configuration: SupabaseAuthRuntimeConfiguration;
  cookies: SupabaseCookieBridge;
}): SupabaseAuthGateway {
  const configuration = resolveSupabaseAuthConfiguration(input.configuration);
  const client = createServerClient(
    configuration.url,
    configuration.publishableKey,
    {
      global: {
        fetch: createProviderTokenRedactingFetch(configuration.url),
      },
      cookies: {
        getAll: async () => {
          const cookies = await input.cookies.getAll();
          return cookies === null
            ? null
            : cookies.map(({ name, value }) => ({ name, value }));
        },
        setAll: (cookies, headers) =>
          input.cookies.setAll(cookies, headers),
      },
    },
  );

  async function getClaimsForToken(
    accessToken?: string,
  ): Promise<SupabaseAuthResult<SupabaseAuthClaims>> {
    try {
      const { data, error } = await client.auth.getClaims(accessToken);
      const mappedError = resultFromError<SupabaseAuthClaims>(
        error,
        "claims-unavailable",
      );
      if (mappedError !== null) {
        return mappedError;
      }
      if (data?.claims === undefined) {
        return failure("session-not-found");
      }
      const claims = mapClaims(data.claims);
      return claims === null
        ? failure("invalid-claims")
        : { data: claims, error: null };
    } catch {
      return failure("service-unavailable");
    }
  }

  async function getCurrentUser(): Promise<
    SupabaseAuthResult<SupabaseAuthUser>
  > {
    try {
      const { data, error } = await client.auth.getUser();
      const mappedError = resultFromError<SupabaseAuthUser>(
        error,
        "user-unavailable",
      );
      if (mappedError !== null) {
        return mappedError;
      }
      return data.user === null
        ? failure("user-not-found")
        : { data: mapUser(data.user), error: null };
    } catch {
      return failure("service-unavailable");
    }
  }

  return {
    challengeMfa: async (factorId) => {
      const normalizedFactorId = normalizeRequired(factorId);
      if (normalizedFactorId === null) {
        return failure("invalid-factor");
      }
      try {
        const { data, error } = await client.auth.mfa.challenge({
          factorId: normalizedFactorId,
        });
        const mappedError = resultFromError<SupabaseMfaChallenge>(
          error,
          "mfa-challenge-failed",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        return data === null
          ? failure("invalid-auth-response")
          : {
              data: {
                challengeId: data.id,
                expiresAt: data.expires_at,
              },
              error: null,
            };
      } catch {
        return failure("service-unavailable");
      }
    },
    enrollTotp: async (friendlyName) => {
      const normalizedFriendlyName =
        friendlyName === undefined
          ? undefined
          : normalizeRequired(friendlyName);
      if (normalizedFriendlyName === null) {
        return failure("invalid-factor-name");
      }
      try {
        const { data, error } = await client.auth.mfa.enroll({
          factorType: "totp",
          ...(normalizedFriendlyName === undefined
            ? {}
            : { friendlyName: normalizedFriendlyName }),
        });
        const mappedError = resultFromError<SupabaseMfaEnrollment>(
          error,
          "mfa-enrollment-failed",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        return data === null
          ? failure("invalid-auth-response")
          : {
              data: {
                factorId: data.id,
                friendlyName: data.friendly_name ?? null,
                qrCode: data.totp.qr_code,
                secret: data.totp.secret,
                uri: data.totp.uri,
              },
              error: null,
            };
      } catch {
        return failure("service-unavailable");
      }
    },
    exchangeCodeForSession: async (code, flowId) => {
      const normalizedCode = normalizeRequired(code);
      if (normalizedCode === null) {
        return failure("invalid-code");
      }
      try {
        const { data, error } =
          await client.auth.exchangeCodeForSession(
            normalizedCode,
            flowId === undefined ? undefined : { flowId },
          );
        const mappedError = resultFromError<SupabaseAuthenticatedResult>(
          error,
          "invalid-code",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        const session = data.session;
        const authenticatedUser = data.user;
        if (session === null || authenticatedUser === null) {
          return failure("invalid-auth-response");
        }
        const claims = await getClaimsForToken(session.access_token);
        return claims.error === null
          ? {
              data: {
                claims: claims.data,
                user: mapUser(authenticatedUser),
              },
              error: null,
            }
          : claims;
      } catch {
        return failure("service-unavailable");
      }
    },
    getClaims: () => getClaimsForToken(),
    getCurrentUser,
    getAuthenticatorAssuranceLevel: async () => {
      try {
        const { data, error } =
          await client.auth.mfa.getAuthenticatorAssuranceLevel();
        const mappedError =
          resultFromError<SupabaseAuthenticatorAssurance>(
            error,
            "aal-unavailable",
          );
        if (mappedError !== null) {
          return mappedError;
        }
        if (data === null) {
          return failure("invalid-auth-response");
        }
        const currentLevel = normalizeAal(data.currentLevel);
        const nextLevel = normalizeAal(data.nextLevel);
        return {
          data: { currentLevel, nextLevel },
          error: null,
        };
      } catch {
        return failure("service-unavailable");
      }
    },
    listMfaFactors: async () => {
      try {
        const { data, error } = await client.auth.mfa.listFactors();
        const mappedError = resultFromError<
          readonly SupabaseMfaFactor[]
        >(error, "mfa-factors-unavailable");
        if (mappedError !== null) {
          return mappedError;
        }
        return data === null
          ? failure("invalid-auth-response")
          : {
              data: data.totp.map((factor) => ({
            createdAt: factor.created_at,
            factorId: factor.id,
            friendlyName: factor.friendly_name ?? null,
            status: factor.status,
            updatedAt: factor.updated_at,
              })),
              error: null,
            };
      } catch {
        return failure("service-unavailable");
      }
    },
    reauthenticate: async () => {
      try {
        const { error } = await client.auth.reauthenticate();
        return (
          resultFromError<null>(error, "reauthentication-failed") ?? {
            data: null,
            error: null,
          }
        );
      } catch {
        return failure("service-unavailable");
      }
    },
    refreshSession: () => getClaimsForToken(),
    requestPasswordReset: async ({ email, redirectTo }) => {
      const normalizedEmail = normalizeRequired(email);
      if (normalizedEmail === null) {
        return failure("invalid-email");
      }
      let normalizedRedirect: string;
      try {
        normalizedRedirect = assertRedirectUrl(redirectTo);
      } catch {
        return failure("invalid-redirect");
      }
      try {
        const { error } = await client.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo: normalizedRedirect },
        );
        return (
          resultFromError<null>(error, "password-reset-failed") ?? {
            data: null,
            error: null,
          }
        );
      } catch {
        return failure("service-unavailable");
      }
    },
    signInWithPassword: async ({ email, password }) => {
      const normalizedEmail = normalizeRequired(email);
      if (normalizedEmail === null || password === "") {
        return failure("invalid-credentials");
      }
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        const mappedError = resultFromError<SupabaseAuthenticatedResult>(
          error,
          "invalid-credentials",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        const session = data.session;
        const authenticatedUser = data.user;
        if (session === null || authenticatedUser === null) {
          return failure("invalid-auth-response");
        }
        const claims = await getClaimsForToken(session.access_token);
        return claims.error === null
          ? {
              data: {
                claims: claims.data,
                user: mapUser(authenticatedUser),
              },
              error: null,
            }
          : claims;
      } catch {
        return failure("service-unavailable");
      }
    },
    signOut: async (scope) => {
      try {
        const { error } = await client.auth.signOut({ scope });
        return (
          resultFromError<null>(error, "sign-out-failed") ?? {
            data: null,
            error: null,
          }
        );
      } catch {
        return failure("service-unavailable");
      }
    },
    signUpWithPassword: async ({
      email,
      emailRedirectTo,
      password,
      username,
    }) => {
      const normalizedEmail = normalizeRequired(email);
      const normalizedUsername = normalizeRequired(username);
      if (
        normalizedEmail === null ||
        normalizedUsername === null ||
        password === ""
      ) {
        return failure("invalid-registration");
      }
      let normalizedRedirect: string;
      try {
        normalizedRedirect = assertRedirectUrl(emailRedirectTo);
      } catch {
        return failure("invalid-redirect");
      }
      try {
        const { data, error } = await client.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { username: normalizedUsername },
            emailRedirectTo: normalizedRedirect,
          },
        });
        const mappedError = resultFromError<SupabaseSignUpResult>(
          error,
          "invalid-registration",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        if (data.user === null) {
          return failure("invalid-auth-response");
        }
        if (data.session === null) {
          return {
            data: { claims: null, user: mapUser(data.user) },
            error: null,
          };
        }
        const claims = await getClaimsForToken(data.session.access_token);
        return claims.error === null
          ? {
              data: { claims: claims.data, user: mapUser(data.user) },
              error: null,
            }
          : claims;
      } catch {
        return failure("service-unavailable");
      }
    },
    startOAuthSignIn: async ({ provider, redirectTo }) => {
      let normalizedRedirect: string;
      try {
        normalizedRedirect = assertRedirectUrl(redirectTo);
      } catch {
        return failure("invalid-redirect");
      }
      try {
        const { data, error } = await client.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: normalizedRedirect,
            scopes: "openid email profile",
            skipBrowserRedirect: true,
          },
        });
        const mappedError = resultFromError<SupabaseOAuthStartResult>(
          error,
          "oauth-start-failed",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        if (data.url === null) {
          return failure("invalid-auth-response");
        }
        let redirectUrl: string;
        try {
          redirectUrl = assertRedirectUrl(data.url);
        } catch {
          return failure("invalid-auth-response");
        }
        if (!isOAuthRedirectUrl(redirectUrl)) {
          return failure("invalid-auth-response");
        }
        return {
          data: {
            flowId: data.flowId ?? null,
            provider,
            redirectUrl,
          },
          error: null,
        };
      } catch {
        return failure("service-unavailable");
      }
    },
    updatePassword: async (password) => {
      if (password === "") {
        return failure("invalid-password");
      }
      try {
        const { data, error } = await client.auth.updateUser({ password });
        const mappedError = resultFromError<SupabaseAuthUser>(
          error,
          "password-update-failed",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        return data.user === null
          ? failure("invalid-auth-response")
          : { data: mapUser(data.user), error: null };
      } catch {
        return failure("service-unavailable");
      }
    },
    updateUserMetadata: async (metadata) => {
      try {
        const { data, error } = await client.auth.updateUser({
          data: metadata,
        });
        const mappedError = resultFromError<SupabaseAuthUser>(
          error,
          "user-update-failed",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        return data.user === null
          ? failure("invalid-auth-response")
          : { data: mapUser(data.user), error: null };
      } catch {
        return failure("service-unavailable");
      }
    },
    verifyOtp: async ({ tokenHash, type }) => {
      const normalizedToken = normalizeRequired(tokenHash);
      if (normalizedToken === null) {
        return failure("invalid-token");
      }
      try {
        const { data, error } = await client.auth.verifyOtp({
          token_hash: normalizedToken,
          type,
        });
        const mappedError = resultFromError<SupabaseConfirmationResult>(
          error,
          "invalid-token",
        );
        if (mappedError !== null) {
          return mappedError;
        }
        return {
          data: {
            user: data.user === null ? null : mapUser(data.user),
          },
          error: null,
        };
      } catch {
        return failure("service-unavailable");
      }
    },
    unenrollMfa: async (factorId) => {
      const normalizedFactorId = normalizeRequired(factorId);
      if (normalizedFactorId === null) {
        return failure("invalid-factor");
      }
      try {
        const { error } = await client.auth.mfa.unenroll({
          factorId: normalizedFactorId,
        });
        return (
          resultFromError<null>(error, "mfa-unenrollment-failed") ?? {
            data: null,
            error: null,
          }
        );
      } catch {
        return failure("service-unavailable");
      }
    },
    verifyMfa: async ({ challengeId, code, factorId }) => {
      const normalizedChallengeId = normalizeRequired(challengeId);
      const normalizedCode = normalizeRequired(code);
      const normalizedFactorId = normalizeRequired(factorId);
      if (
        normalizedChallengeId === null ||
        normalizedCode === null ||
        normalizedFactorId === null
      ) {
        return failure("invalid-mfa-verification");
      }
      try {
        const { error } = await client.auth.mfa.verify({
          challengeId: normalizedChallengeId,
          code: normalizedCode,
          factorId: normalizedFactorId,
        });
        return (
          resultFromError<null>(error, "mfa-verification-failed") ?? {
            data: null,
            error: null,
          }
        );
      } catch {
        return failure("service-unavailable");
      }
    },
  };
}
