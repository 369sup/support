import type { SupabaseAuthGateway } from "@support/supabase/auth";
import { describe, expect, it, vi } from "vitest";

import { SupabaseAuthenticationAdapter } from "../adapters/outbound/integration/supabase-authentication.adapter";
import type {
  ExternalIdentityAccount,
  ExternalIdentityRepositoryPort,
} from "../application/ports/outbound/external-identity.repository.port";

const identity: ExternalIdentityAccount = {
  account: {
    accountId: "account-1",
    accountType: "personal",
    displayName: "octocat",
    lifecycleState: "active",
    usage: "human",
    username: "octocat",
  },
  email: "octocat@example.com",
  provider: "supabase",
  subject: "subject-1",
};

function createIdentityRepository(
  overrides: Partial<ExternalIdentityRepositoryPort> = {},
): ExternalIdentityRepositoryPort {
  return {
    findBySubject: vi.fn(() => Promise.resolve(identity)),
    findVerifiedEmailByUsername: vi.fn(() =>
      Promise.resolve(identity.email),
    ),
    isExternalOnboardingReady: vi.fn(() => Promise.resolve(true)),
    isReady: vi.fn(() => Promise.resolve(true)),
    isUsernameAvailable: vi.fn(() => Promise.resolve(true)),
    ...overrides,
  };
}

function createGateway(): SupabaseAuthGateway {
  return {
    exchangeCodeForSession: vi.fn(),
    getClaims: vi.fn(() =>
      Promise.resolve({
        data: {
          expiresAt: 2_000_000_000,
          issuedAt: 1_900_000_000,
          sessionId: "session-1",
          subject: identity.subject,
        },
        error: null,
      }),
    ),
    getCurrentUser: vi.fn(),
    refreshSession: vi.fn(),
    requestPasswordReset: vi.fn(),
    signInWithPassword: vi.fn(() =>
      Promise.resolve({
        data: {
          claims: {
            expiresAt: 2_000_000_000,
            issuedAt: 1_900_000_000,
            sessionId: "session-1",
            subject: identity.subject,
          },
          user: {
            email: identity.email,
            emailVerifiedAt: "2026-07-29T00:00:00.000Z",
            providers: ["email"],
            subject: identity.subject,
            userMetadata: {},
          },
        },
        error: null,
      }),
    ),
    signOut: vi.fn(() =>
      Promise.resolve({ data: null, error: null }),
    ),
    signUpWithPassword: vi.fn(),
    startOAuthSignIn: vi.fn(),
    updatePassword: vi.fn(),
    updateUserMetadata: vi.fn(),
    verifyOtp: vi.fn(),
  };
}

describe("SupabaseAuthenticationAdapter", () => {
  it("resolves a username to verified email before password sign-in", async () => {
    const identities = createIdentityRepository();
    const gateway = createGateway();
    const adapter = new SupabaseAuthenticationAdapter(
      identities,
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.signInWithPassword({
        identifier: "OctoCat",
        password: "correct horse battery staple",
      }),
    ).resolves.toMatchObject({
      status: "created",
      session: {
        account: identity.account,
        sessionId: "session-1",
        status: "active",
      },
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(identities.findVerifiedEmailByUsername).toHaveBeenCalledWith(
      "OctoCat",
    );
    expect(gateway.signInWithPassword).toHaveBeenCalledWith({
      email: identity.email,
      password: "correct horse battery staple",
    });
  });

  it("returns the same invalid-credentials result for an unknown username", async () => {
    const gateway = createGateway();
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        findVerifiedEmailByUsername: vi.fn(() => Promise.resolve(null)),
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.signInWithPassword({
        identifier: "unknown",
        password: "not-the-password",
      }),
    ).resolves.toEqual({ status: "invalid-credentials" });
    expect(gateway.signInWithPassword).not.toHaveBeenCalled();
  });

  it("fails closed before creating an Auth user when migrations are absent", async () => {
    const gateway = createGateway();
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        isReady: vi.fn(() => Promise.resolve(false)),
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.signUpWithPassword({
        email: identity.email,
        emailRedirectTo: "https://support.example.com/auth/callback",
        password: "correct horse battery staple",
        username: identity.account.username,
      }),
    ).resolves.toEqual({ status: "service-unavailable" });
    expect(gateway.signUpWithPassword).not.toHaveBeenCalled();
  });

  it("maps verified claims to a provider-neutral current session", async () => {
    const gateway = createGateway();
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository(),
      () => Promise.resolve(gateway),
    );

    await expect(adapter.getOptionalCurrentSession()).resolves.toMatchObject({
      account: identity.account,
      sessionId: "session-1",
      status: "active",
    });
  });

  it("starts Google sign-in through the package gateway", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.startOAuthSignIn).mockResolvedValue({
      data: {
        flowId: "flow-1",
        provider: "google",
        redirectUrl: "https://project.supabase.co/auth/v1/authorize",
      },
      error: null,
    });
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository(),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.startExternalSignIn({
        provider: "google",
        redirectTo:
          "https://support.example.com/auth/callback?next=%2Fdashboard",
      }),
    ).resolves.toEqual({
      redirectUrl: "https://project.supabase.co/auth/v1/authorize",
      status: "redirect",
    });
  });

  it("keeps Google unavailable until the onboarding migration is ready", async () => {
    const gateway = createGateway();
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        isExternalOnboardingReady: vi.fn(() => Promise.resolve(false)),
        isReady: vi.fn(() => Promise.resolve(true)),
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.startExternalSignIn({
        provider: "google",
        redirectTo: "https://support.example.com/auth/callback",
      }),
    ).resolves.toEqual({ status: "service-unavailable" });
    expect(gateway.startOAuthSignIn).not.toHaveBeenCalled();
  });

  it("requires username onboarding for a new verified Google user", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.exchangeCodeForSession).mockResolvedValue({
      data: {
        claims: {
          expiresAt: 2_000_000_000,
          issuedAt: 1_900_000_000,
          sessionId: "session-1",
          subject: identity.subject,
        },
        user: {
          email: identity.email,
          emailVerifiedAt: "2026-07-29T00:00:00.000Z",
          providers: ["google"],
          subject: identity.subject,
          userMetadata: {},
        },
      },
      error: null,
    });
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        findBySubject: vi.fn(() => Promise.resolve(null)),
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalSignIn({
        code: "oauth-code",
        flowId: "flow-1",
      }),
    ).resolves.toEqual({
      email: identity.email,
      status: "onboarding-required",
    });
  });

  it("authenticates a Google callback when automatic linking finds the existing account", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.exchangeCodeForSession).mockResolvedValue({
      data: {
        claims: {
          expiresAt: 2_000_000_000,
          issuedAt: 1_900_000_000,
          sessionId: "session-1",
          subject: identity.subject,
        },
        user: {
          email: identity.email,
          emailVerifiedAt: "2026-07-29T00:00:00.000Z",
          providers: ["email", "google"],
          subject: identity.subject,
          userMetadata: {},
        },
      },
      error: null,
    });
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository(),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalSignIn({ code: "oauth-code" }),
    ).resolves.toMatchObject({
      session: {
        account: identity.account,
        sessionId: "session-1",
      },
      status: "authenticated",
    });
  });

  it("completes Google onboarding by setting validated username metadata", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.getCurrentUser).mockResolvedValue({
      data: {
        email: identity.email,
        emailVerifiedAt: "2026-07-29T00:00:00.000Z",
        providers: ["google"],
        subject: identity.subject,
        userMetadata: {},
      },
      error: null,
    });
    vi.mocked(gateway.updateUserMetadata).mockResolvedValue({
      data: {
        email: identity.email,
        emailVerifiedAt: "2026-07-29T00:00:00.000Z",
        providers: ["google"],
        subject: identity.subject,
        userMetadata: { username: "octocat" },
      },
      error: null,
    });
    const findBySubject = vi
      .fn<ExternalIdentityRepositoryPort["findBySubject"]>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(identity);
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({ findBySubject }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalAccountProvisioning({
        username: "octocat",
      }),
    ).resolves.toEqual({ status: "created" });
    expect(gateway.updateUserMetadata).toHaveBeenCalledWith({
      username: "octocat",
    });
  });

  it("rejects a conflicting onboarding username before updating Auth metadata", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.getCurrentUser).mockResolvedValue({
      data: {
        email: identity.email,
        emailVerifiedAt: "2026-07-29T00:00:00.000Z",
        providers: ["google"],
        subject: identity.subject,
        userMetadata: {},
      },
      error: null,
    });
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        findBySubject: vi.fn(() => Promise.resolve(null)),
        isUsernameAvailable: vi.fn(() => Promise.resolve(false)),
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalAccountProvisioning({
        username: "octocat",
      }),
    ).resolves.toEqual({ status: "username-conflict" });
    expect(gateway.updateUserMetadata).not.toHaveBeenCalled();
  });

  it("treats a completed onboarding retry as idempotently created", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.getCurrentUser).mockResolvedValue({
      data: {
        email: identity.email,
        emailVerifiedAt: "2026-07-29T00:00:00.000Z",
        providers: ["google"],
        subject: identity.subject,
        userMetadata: { username: identity.account.username },
      },
      error: null,
    });
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository(),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalAccountProvisioning({
        username: identity.account.username,
      }),
    ).resolves.toEqual({ status: "created" });
    expect(gateway.updateUserMetadata).not.toHaveBeenCalled();
  });

  it("reports a username race from the atomic provisioning trigger", async () => {
    const gateway = createGateway();
    vi.mocked(gateway.getCurrentUser).mockResolvedValue({
      data: {
        email: identity.email,
        emailVerifiedAt: "2026-07-29T00:00:00.000Z",
        providers: ["google"],
        subject: identity.subject,
        userMetadata: {},
      },
      error: null,
    });
    vi.mocked(gateway.updateUserMetadata).mockResolvedValue({
      data: null,
      error: { code: "user-update-failed", status: 409 },
    });
    const isUsernameAvailable = vi
      .fn<ExternalIdentityRepositoryPort["isUsernameAvailable"]>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const adapter = new SupabaseAuthenticationAdapter(
      createIdentityRepository({
        findBySubject: vi.fn(() => Promise.resolve(null)),
        isUsernameAvailable,
      }),
      () => Promise.resolve(gateway),
    );

    await expect(
      adapter.completeExternalAccountProvisioning({
        username: identity.account.username,
      }),
    ).resolves.toEqual({ status: "username-conflict" });
  });
});
