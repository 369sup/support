import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const doubles = vi.hoisted(() => {
  const mfa = {
    challenge: vi.fn(),
    enroll: vi.fn(),
    getAuthenticatorAssuranceLevel: vi.fn(),
    listFactors: vi.fn(),
    unenroll: vi.fn(),
    verify: vi.fn(),
  };
  const auth = {
    exchangeCodeForSession: vi.fn(),
    getClaims: vi.fn(),
    getUser: vi.fn(),
    mfa,
    reauthenticate: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signInWithOAuth: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    updateUser: vi.fn(),
    verifyOtp: vi.fn(),
  };
  return {
    auth,
    createServerClient: vi.fn(
      (
        url: string,
        key: string,
        options: {
          cookies: {
            getAll: () => unknown;
            setAll: (
              cookies: readonly unknown[],
              headers: Readonly<Record<string, string>>,
            ) => unknown;
          };
          global?: {
            fetch?: typeof fetch;
          };
        },
      ) => {
        void url;
        void key;
        void options;
        return { auth };
      },
    ),
  };
});

vi.mock("@supabase/ssr", () => ({
  createServerClient: doubles.createServerClient,
}));

import {
  createSupabaseAuthGateway,
  type SupabaseCookieBridge,
} from "../src/auth";

const configuration = {
  publishableKey: "sb_publishable_example",
  url: "https://project.supabase.co",
};

const user = {
  app_metadata: {
    provider: "google",
    providers: ["email", "google"],
  },
  aud: "authenticated",
  created_at: "2026-07-29T00:00:00.000Z",
  email: "octocat@example.com",
  email_confirmed_at: "2026-07-29T00:00:00.000Z",
  id: "subject-1",
  user_metadata: {
    avatar_url: "https://example.com/avatar.png",
  },
};

const claims = {
  aal: "aal1",
  exp: 2_000_000_000,
  iat: 1_900_000_000,
  session_id: "session-1",
  sub: user.id,
};

function createCookieBridge(
  overrides: Partial<SupabaseCookieBridge> = {},
): SupabaseCookieBridge {
  return {
    getAll: vi.fn(() => [{ name: "sb-session", value: "session" }]),
    setAll: vi.fn(),
    ...overrides,
  };
}

describe("createSupabaseAuthGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    doubles.createServerClient.mockReturnValue({ auth: doubles.auth });
    doubles.auth.getClaims.mockResolvedValue({
      data: { claims },
      error: null,
    });
    doubles.auth.getUser.mockResolvedValue({
      data: { user },
      error: null,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("owns the SSR client and forwards cookies with cache-control headers", async () => {
    const cookies = createCookieBridge();
    createSupabaseAuthGateway({ configuration, cookies });

    const clientOptions = doubles.createServerClient.mock.calls[0]?.[2];
    expect(clientOptions).toBeDefined();
    await expect(clientOptions?.cookies.getAll()).resolves.toEqual([
      { name: "sb-session", value: "session" },
    ]);
    await clientOptions?.cookies.setAll(
      [
        {
          name: "sb-session",
          options: { httpOnly: true },
          value: "updated-session",
        },
      ],
      { "cache-control": "private, no-store" },
    );
    expect(cookies.setAll).toHaveBeenCalledWith(
      [
        {
          name: "sb-session",
          options: { httpOnly: true },
          value: "updated-session",
        },
      ],
      { "cache-control": "private, no-store" },
    );
  });

  it("normalizes password sessions without exposing SDK clients or tokens", async () => {
    doubles.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: "access-token" },
        user,
      },
      error: null,
    });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    await expect(
      gateway.signInWithPassword({
        email: user.email,
        password: "correct horse battery staple",
      }),
    ).resolves.toEqual({
      data: {
        claims: {
          aal: "aal1",
          expiresAt: claims.exp,
          issuedAt: claims.iat,
          sessionId: claims.session_id,
          subject: user.id,
        },
        user: {
          email: user.email,
          emailVerifiedAt: user.email_confirmed_at,
          providers: ["email", "google"],
          subject: user.id,
          userMetadata: user.user_metadata,
        },
      },
      error: null,
    });
    expect(doubles.auth.getClaims).toHaveBeenCalledWith("access-token");
  });

  it("starts a server-side Google PKCE flow with only identity scopes", async () => {
    doubles.auth.signInWithOAuth.mockResolvedValue({
      data: {
        flowId: "flow-1",
        provider: "google",
        url: "https://project.supabase.co/auth/v1/authorize",
      },
      error: null,
    });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    await expect(
      gateway.startOAuthSignIn({
        provider: "google",
        redirectTo:
          "https://support.example.com/auth/callback?next=%2Fdashboard",
      }),
    ).resolves.toEqual({
      data: {
        flowId: "flow-1",
        provider: "google",
        redirectUrl: "https://project.supabase.co/auth/v1/authorize",
      },
      error: null,
    });
    expect(doubles.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo:
          "https://support.example.com/auth/callback?next=%2Fdashboard",
        scopes: "openid email profile",
        skipBrowserRedirect: true,
      },
    });
  });

  it("redacts Google provider tokens before the SDK can persist the session", async () => {
    const upstreamFetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            access_token: "supabase-access-token",
            provider_refresh_token: "google-refresh-token",
            provider_token: "google-access-token",
            refresh_token: "supabase-refresh-token",
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        ),
      ),
    );
    vi.stubGlobal("fetch", upstreamFetch);
    createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    const redactingFetch =
      doubles.createServerClient.mock.calls[0]?.[2].global?.fetch;
    expect(redactingFetch).toBeDefined();
    const response = await redactingFetch?.(
      "https://project.supabase.co/auth/v1/token?grant_type=pkce",
    );
    await expect(response?.json()).resolves.toEqual({
      access_token: "supabase-access-token",
      refresh_token: "supabase-refresh-token",
    });
  });

  it("rejects deceptive local OAuth redirect URLs", async () => {
    doubles.auth.signInWithOAuth.mockResolvedValue({
      data: {
        flowId: "flow-1",
        provider: "google",
        url: "http://localhost.evil.example/authorize",
      },
      error: null,
    });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    await expect(
      gateway.startOAuthSignIn({
        provider: "google",
        redirectTo: "https://support.example.com/auth/callback",
      }),
    ).resolves.toEqual({
      data: null,
      error: { code: "invalid-auth-response", status: null },
    });
  });

  it("exchanges an OAuth code and returns verified normalized identity", async () => {
    doubles.auth.exchangeCodeForSession.mockResolvedValue({
      data: {
        session: { access_token: "access-token" },
        user,
      },
      error: null,
    });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    await expect(
      gateway.exchangeCodeForSession("oauth-code", "flow-1"),
    ).resolves.toMatchObject({
      data: {
        claims: { subject: user.id },
        user: {
          providers: ["email", "google"],
          subject: user.id,
        },
      },
      error: null,
    });
    expect(doubles.auth.exchangeCodeForSession).toHaveBeenCalledWith(
      "oauth-code",
      { flowId: "flow-1" },
    );
  });

  it("normalizes the Supabase TOTP enrollment and verification flow", async () => {
    doubles.auth.mfa.enroll.mockResolvedValue({
      data: {
        id: "factor-1",
        totp: {
          qr_code: "<svg />",
          secret: "secret",
          uri: "otpauth://totp/support",
        },
        type: "totp",
      },
      error: null,
    });
    doubles.auth.mfa.challenge.mockResolvedValue({
      data: { expires_at: 1_800_000_000, id: "challenge-1" },
      error: null,
    });
    doubles.auth.mfa.verify.mockResolvedValue({ data: {}, error: null });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    await expect(gateway.enrollTotp("Support account")).resolves.toMatchObject({
      data: {
        factorId: "factor-1",
        qrCode: "<svg />",
        secret: "secret",
        uri: "otpauth://totp/support",
      },
      error: null,
    });
    await expect(gateway.challengeMfa("factor-1")).resolves.toEqual({
      data: {
        challengeId: "challenge-1",
        expiresAt: 1_800_000_000,
      },
      error: null,
    });
    await expect(
      gateway.verifyMfa({
        challengeId: "challenge-1",
        code: "123456",
        factorId: "factor-1",
      }),
    ).resolves.toEqual({ data: null, error: null });
  });

  it("returns stable failures without provider error messages", async () => {
    doubles.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: "google",
        url: null,
      },
      error: {
        code: "provider_disabled",
        message: "secret provider detail",
        status: 400,
      },
    });
    const gateway = createSupabaseAuthGateway({
      configuration,
      cookies: createCookieBridge(),
    });

    const result = await gateway.startOAuthSignIn({
      provider: "google",
      redirectTo: "https://support.example.com/auth/callback",
    });
    expect(result).toEqual({
      data: null,
      error: { code: "provider_disabled", status: 400 },
    });
    expect(JSON.stringify(result)).not.toContain("secret provider detail");
  });
});
