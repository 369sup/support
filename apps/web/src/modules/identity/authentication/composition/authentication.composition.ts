import "server-only";

import { createRequiredCurrentSessionAdapter } from "../adapters/inbound/next/required-current-session.adapter";
import { createSupabaseServerAuthGateway } from "../adapters/inbound/next/supabase-auth-gateway.adapter";
import { SupabaseAuthenticationAdapter } from "../adapters/outbound/integration/supabase-authentication.adapter";
import { PostgresExternalIdentityAdapter } from "../adapters/outbound/persistence/postgres-external-identity.adapter";
import { EnrollTotpHandler } from "../application/commands/enroll-totp.handler";
import { ReauthenticateHandler } from "../application/commands/reauthenticate.handler";
import { RequestSupabasePasswordResetHandler } from "../application/commands/request-supabase-password-reset.handler";
import { UpdateSupabasePasswordHandler } from "../application/commands/update-supabase-password.handler";
import { VerifyMfaHandler } from "../application/commands/verify-mfa.handler";
import { VerifySupabaseOtpHandler } from "../application/commands/verify-supabase-otp.handler";
import type {
  AuthenticatedSessionReference,
  CurrentSessionResult,
} from "../contracts/authenticated-session-reference";
import type {
  ExternalAccountProvisioningResult,
  ExternalAccountProvisioningState,
  ExternalAuthenticationProvider,
  ExternalSignInCompletionResult,
  ExternalSignInStartResult,
  SupabaseConfirmationResult,
  SupabasePasswordSignInResult,
  SupabasePasswordSignUpResult,
} from "../contracts/supabase-authentication";
import type {
  MfaAssuranceResult,
  MfaChallengeResult,
  MfaFactorsResult,
  MfaMutationResult,
  TotpEnrollmentResult,
} from "../contracts/supabase-mfa";
import { getProductionDatabase } from "../../../../../production-runtime";

type EmailConfirmationType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

export interface AuthenticationServerFacade {
  challengeMfa: (factorId: string) => Promise<MfaChallengeResult>;
  completeExternalAccountProvisioning: (input: {
    username: string;
  }) => Promise<ExternalAccountProvisioningResult>;
  completeExternalSignIn: (input: {
    code: string;
    flowId?: string;
  }) => Promise<ExternalSignInCompletionResult>;
  enrollTotp: (friendlyName?: string) => Promise<TotpEnrollmentResult>;
  getAuthenticatorAssuranceLevel: () => Promise<MfaAssuranceResult>;
  getCurrentAuthenticatedSession: () => Promise<CurrentSessionResult>;
  getExternalAccountProvisioningState: () => Promise<ExternalAccountProvisioningState>;
  getOptionalCurrentSession: () => Promise<AuthenticatedSessionReference | null>;
  isPasswordAuthenticationEnabled: () => boolean;
  isSupabaseAuthenticationEnabled: () => boolean;
  listMfaFactors: () => Promise<MfaFactorsResult>;
  reauthenticate: () => Promise<MfaMutationResult>;
  requestSupabasePasswordReset: (input: {
    email: string;
    redirectTo: string;
  }) => Promise<void>;
  requireCurrentSession: () => Promise<AuthenticatedSessionReference>;
  signInWithPassword: (input: {
    identifier: string;
    password: string;
  }) => Promise<SupabasePasswordSignInResult>;
  signOutAllSessions: () => Promise<boolean>;
  signOutCurrentSession: () => Promise<boolean>;
  signOutOtherSessions: () => Promise<boolean>;
  signOut: (scope: "global" | "local" | "others") => Promise<boolean>;
  signUpWithPassword: (input: {
    email: string;
    emailRedirectTo: string;
    password: string;
    username: string;
  }) => Promise<SupabasePasswordSignUpResult>;
  startExternalSignIn: (input: {
    provider: ExternalAuthenticationProvider;
    redirectTo: string;
  }) => Promise<ExternalSignInStartResult>;
  unenrollMfa: (factorId: string) => Promise<MfaMutationResult>;
  updateSupabasePassword: (password: string) => Promise<boolean>;
  verifyMfa: (input: {
    challengeId: string;
    code: string;
    factorId: string;
  }) => Promise<MfaMutationResult>;
  verifySupabaseOtp: (input: {
    tokenHash: string;
    type: EmailConfirmationType;
  }) => Promise<SupabaseConfirmationResult>;
}

function composeAuthenticationServerFacade(): AuthenticationServerFacade {
  const supabaseAuthentication = new SupabaseAuthenticationAdapter(
    new PostgresExternalIdentityAdapter(getProductionDatabase()),
    createSupabaseServerAuthGateway,
  );
  const currentSession = createRequiredCurrentSessionAdapter(() =>
    supabaseAuthentication.getOptionalCurrentSession(),
  );
  const enrollTotp = new EnrollTotpHandler(supabaseAuthentication);
  const reauthenticate = new ReauthenticateHandler(supabaseAuthentication);
  const requestPasswordReset = new RequestSupabasePasswordResetHandler(
    supabaseAuthentication,
  );
  const updatePassword = new UpdateSupabasePasswordHandler(
    supabaseAuthentication,
  );
  const verifyMfa = new VerifyMfaHandler(supabaseAuthentication);
  const verifyOtp = new VerifySupabaseOtpHandler(supabaseAuthentication);

  return {
    challengeMfa: (factorId) =>
      supabaseAuthentication.challengeMfa(factorId),
    completeExternalAccountProvisioning: (input) =>
      supabaseAuthentication.completeExternalAccountProvisioning(input),
    completeExternalSignIn: (input) =>
      supabaseAuthentication.completeExternalSignIn(input),
    enrollTotp: (friendlyName) => enrollTotp.enrollTotp(friendlyName),
    getAuthenticatorAssuranceLevel: () =>
      supabaseAuthentication.getAuthenticatorAssuranceLevel(),
    getCurrentAuthenticatedSession: async () => {
      const session =
        await supabaseAuthentication.getOptionalCurrentSession();
      return session === null
        ? { status: "authentication-required" }
        : { session, status: "authenticated" };
    },
    getExternalAccountProvisioningState: () =>
      supabaseAuthentication.getExternalAccountProvisioningState(),
    getOptionalCurrentSession: currentSession.getOptionalCurrentSession,
    isPasswordAuthenticationEnabled: () => true,
    isSupabaseAuthenticationEnabled: () => true,
    listMfaFactors: () => supabaseAuthentication.listMfaFactors(),
    reauthenticate: () => reauthenticate.reauthenticate(),
    requestSupabasePasswordReset: async (input) => {
      await requestPasswordReset.requestSupabasePasswordReset(input);
    },
    requireCurrentSession: currentSession.requireCurrentSession,
    signInWithPassword: (input) =>
      supabaseAuthentication.signInWithPassword(input),
    signOutAllSessions: () => supabaseAuthentication.signOut("global"),
    signOutCurrentSession: () => supabaseAuthentication.signOut("local"),
    signOutOtherSessions: () => supabaseAuthentication.signOut("others"),
    signOut: (scope) => supabaseAuthentication.signOut(scope),
    signUpWithPassword: (input) =>
      supabaseAuthentication.signUpWithPassword(input),
    startExternalSignIn: (input) =>
      supabaseAuthentication.startExternalSignIn(input),
    unenrollMfa: (factorId) =>
      supabaseAuthentication.unenrollMfa(factorId),
    updateSupabasePassword: async (password) =>
      (await updatePassword.updateSupabasePassword(password)).status ===
      "changed",
    verifyMfa: (input) => verifyMfa.verifyMfa(input),
    verifySupabaseOtp: (input) => verifyOtp.verifySupabaseOtp(input),
  };
}

export const authenticationServerFacade =
  composeAuthenticationServerFacade();
