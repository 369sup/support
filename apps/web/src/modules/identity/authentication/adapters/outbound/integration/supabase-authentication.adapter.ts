import "server-only";

import type {
  SupabaseAuthClaims,
  SupabaseAuthGateway,
  SupabaseAuthUser,
  SupabaseEmailOtpType,
} from "@support/supabase/auth";

import type { ExternalIdentityRepositoryPort } from "../../../application/ports/outbound/external-identity.repository.port";
import type { AuthenticatedSessionReference } from "../../../contracts/authenticated-session-reference";
import type {
  ExternalAccountProvisioningResult,
  ExternalAccountProvisioningState,
  ExternalAuthenticationProvider,
  ExternalSignInCompletionResult,
  ExternalSignInStartResult,
  SupabaseConfirmationResult,
  SupabasePasswordSignInResult,
  SupabasePasswordSignUpResult,
} from "../../../contracts/supabase-authentication";
import type {
  MfaAssuranceResult,
  MfaChallengeResult,
  MfaFactorsResult,
  MfaMutationResult,
  TotpEnrollmentResult,
} from "../../../contracts/supabase-mfa";

type SupabaseAuthGatewayFactory = () => Promise<SupabaseAuthGateway>;

function looksLikeEmail(value: string): boolean {
  const atIndex = value.indexOf("@");
  return atIndex > 0 && atIndex < value.length - 1;
}

function isValidUsername(value: string): boolean {
  return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/u.test(
    value,
  );
}

export class SupabaseAuthenticationAdapter {
  private readonly identities: ExternalIdentityRepositoryPort;
  private readonly createGateway: SupabaseAuthGatewayFactory;

  constructor(
    identities: ExternalIdentityRepositoryPort,
    createGateway: SupabaseAuthGatewayFactory,
  ) {
    this.identities = identities;
    this.createGateway = createGateway;
  }

  async getOptionalCurrentSession(): Promise<AuthenticatedSessionReference | null> {
    try {
      if (!(await this.identities.isReady())) {
        return null;
      }
      const gateway = await this.createGateway();
      const result = await gateway.getClaims();
      return result.error === null
        ? this.mapClaims(result.data)
        : null;
    } catch {
      return null;
    }
  }

  async startExternalSignIn(input: {
    provider: ExternalAuthenticationProvider;
    redirectTo: string;
  }): Promise<ExternalSignInStartResult> {
    try {
      if (!(await this.identities.isExternalOnboardingReady())) {
        return { status: "service-unavailable" };
      }
      const gateway = await this.createGateway();
      const result = await gateway.startOAuthSignIn(input);
      return result.error === null
        ? {
            redirectUrl: result.data.redirectUrl,
            status: "redirect",
          }
        : { status: "service-unavailable" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async completeExternalSignIn(input: {
    code: string;
    flowId?: string;
  }): Promise<ExternalSignInCompletionResult> {
    try {
      if (!(await this.identities.isExternalOnboardingReady())) {
        return { status: "service-unavailable" };
      }
      const gateway = await this.createGateway();
      const result = await gateway.exchangeCodeForSession(
        input.code,
        input.flowId,
      );
      if (result.error !== null) {
        return { status: "invalid-callback" };
      }
      const identity = await this.identities.findBySubject(
        "supabase",
        result.data.claims.subject,
      );
      if (identity !== null) {
        const session = await this.mapClaims(result.data.claims);
        return session === null
          ? { status: "invalid-callback" }
          : { session, status: "authenticated" };
      }
      return this.isGoogleOnboardingUser(result.data.user)
        ? {
            email: result.data.user.email,
            status: "onboarding-required",
          }
        : { status: "invalid-callback" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async getExternalAccountProvisioningState(): Promise<ExternalAccountProvisioningState> {
    try {
      if (!(await this.identities.isExternalOnboardingReady())) {
        return { status: "unavailable" };
      }
      const gateway = await this.createGateway();
      const result = await gateway.getCurrentUser();
      if (result.error !== null) {
        return { status: "unavailable" };
      }
      const identity = await this.identities.findBySubject(
        "supabase",
        result.data.subject,
      );
      if (identity !== null) {
        return { status: "authenticated" };
      }
      return this.isGoogleOnboardingUser(result.data)
        ? { email: result.data.email, status: "required" }
        : { status: "unavailable" };
    } catch {
      return { status: "unavailable" };
    }
  }

  async completeExternalAccountProvisioning(input: {
    username: string;
  }): Promise<ExternalAccountProvisioningResult> {
    const username = input.username.trim();
    if (!isValidUsername(username)) {
      return { status: "invalid-username" };
    }
    try {
      if (!(await this.identities.isExternalOnboardingReady())) {
        return { status: "service-unavailable" };
      }
      const gateway = await this.createGateway();
      const userResult = await gateway.getCurrentUser();
      if (
        userResult.error !== null ||
        !this.isGoogleOnboardingUser(userResult.data)
      ) {
        return { status: "account-conflict" };
      }
      const existingIdentity = await this.identities.findBySubject(
        "supabase",
        userResult.data.subject,
      );
      if (existingIdentity !== null) {
        return { status: "created" };
      }
      if (!(await this.identities.isUsernameAvailable(username))) {
        return { status: "username-conflict" };
      }
      const updateResult = await gateway.updateUserMetadata({ username });
      const provisionedIdentity = await this.identities.findBySubject(
        "supabase",
        userResult.data.subject,
      );
      if (provisionedIdentity !== null) {
        return { status: "created" };
      }
      if (
        updateResult.error !== null &&
        !(await this.identities.isUsernameAvailable(username))
      ) {
        return { status: "username-conflict" };
      }
      return updateResult.error === null
        ? { status: "service-unavailable" }
        : { status: "account-conflict" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async signInWithPassword(input: {
    identifier: string;
    password: string;
  }): Promise<SupabasePasswordSignInResult> {
    const identifier = input.identifier.trim();
    if (identifier === "" || input.password === "") {
      return { status: "invalid-credentials" };
    }
    try {
      if (!(await this.identities.isReady())) {
        return { status: "service-unavailable" };
      }
      const email = looksLikeEmail(identifier)
        ? identifier
        : await this.identities.findVerifiedEmailByUsername(identifier);
      if (email === null) {
        return { status: "invalid-credentials" };
      }
      const gateway = await this.createGateway();
      const result = await gateway.signInWithPassword({
        email,
        password: input.password,
      });
      if (result.error !== null) {
        return { status: "invalid-credentials" };
      }
      const session = await this.mapClaims(result.data.claims);
      if (session === null) {
        await gateway.signOut("local");
        return { status: "service-unavailable" };
      }
      return { session, status: "created" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async signUpWithPassword(input: {
    email: string;
    emailRedirectTo: string;
    password: string;
    username: string;
  }): Promise<SupabasePasswordSignUpResult> {
    try {
      if (!(await this.identities.isReady())) {
        return { status: "service-unavailable" };
      }
      const gateway = await this.createGateway();
      const result = await gateway.signUpWithPassword(input);
      if (result.error !== null) {
        return { status: "invalid-registration" };
      }
      if (result.data.claims === null) {
        return { status: "confirmation-required" };
      }
      const session = await this.mapClaims(result.data.claims);
      return session === null
        ? { status: "service-unavailable" }
        : { session, status: "created" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async signOut(scope: "global" | "local" | "others"): Promise<boolean> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.signOut(scope);
      return result.error === null;
    } catch {
      return false;
    }
  }

  async getAuthenticatorAssuranceLevel(): Promise<MfaAssuranceResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.getAuthenticatorAssuranceLevel();
      return result.error === null
        ? { ...result.data, status: "found" }
        : { status: "service-unavailable" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async listMfaFactors(): Promise<MfaFactorsResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.listMfaFactors();
      return result.error === null
        ? { factors: result.data, status: "found" }
        : { status: "service-unavailable" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async enrollTotp(friendlyName?: string): Promise<TotpEnrollmentResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.enrollTotp(friendlyName);
      return result.error === null
        ? { ...result.data, status: "enrolled" }
        : {
            status:
              result.error.code === "invalid-factor-name"
                ? "invalid-factor"
                : "service-unavailable",
          };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async challengeMfa(factorId: string): Promise<MfaChallengeResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.challengeMfa(factorId);
      return result.error === null
        ? { ...result.data, status: "challenged" }
        : {
            status:
              result.error.code === "invalid-factor"
                ? "invalid-factor"
                : "service-unavailable",
          };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async verifyMfa(input: {
    challengeId: string;
    code: string;
    factorId: string;
  }): Promise<MfaMutationResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.verifyMfa(input);
      return result.error === null
        ? { status: "updated" }
        : { status: "invalid-verification" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async unenrollMfa(factorId: string): Promise<MfaMutationResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.unenrollMfa(factorId);
      return result.error === null
        ? { status: "updated" }
        : {
            status:
              result.error.code === "invalid-factor"
                ? "invalid-factor"
                : "service-unavailable",
          };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async reauthenticate(): Promise<MfaMutationResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.reauthenticate();
      return result.error === null
        ? { status: "updated" }
        : { status: "service-unavailable" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  async requestPasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<void> {
    try {
      const gateway = await this.createGateway();
      await gateway.requestPasswordReset(input);
    } catch {
      // Always return the same result to prevent account enumeration.
    }
  }

  async updatePassword(password: string): Promise<boolean> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.updatePassword(password);
      return result.error === null;
    } catch {
      return false;
    }
  }

  async verifyOtp(input: {
    tokenHash: string;
    type: SupabaseEmailOtpType;
  }): Promise<SupabaseConfirmationResult> {
    try {
      const gateway = await this.createGateway();
      const result = await gateway.verifyOtp(input);
      return result.error === null
        ? { status: "confirmed" }
        : { status: "invalid-confirmation" };
    } catch {
      return { status: "service-unavailable" };
    }
  }

  private async mapClaims(
    claims: SupabaseAuthClaims,
  ): Promise<AuthenticatedSessionReference | null> {
    const subject = claims.subject;
    const identity = await this.identities.findBySubject(
      "supabase",
      subject,
    );
    if (
      identity === null ||
      identity.account.lifecycleState !== "active"
    ) {
      return null;
    }
    return {
      aal: claims.aal,
      account: identity.account,
      authenticatedAt:
        claims.issuedAt === null
          ? new Date().toISOString()
          : new Date(claims.issuedAt * 1000).toISOString(),
      expiresAt:
        claims.expiresAt === null
          ? null
          : new Date(claims.expiresAt * 1000).toISOString(),
      sessionId: claims.sessionId ?? subject,
      status: "active",
      supabaseUserId: subject,
    };
  }

  private isGoogleOnboardingUser(
    user: SupabaseAuthUser,
  ): user is SupabaseAuthUser & Readonly<{ email: string }> {
    return (
      user.providers.includes("google") &&
      user.email !== null &&
      user.emailVerifiedAt !== null
    );
  }
}
