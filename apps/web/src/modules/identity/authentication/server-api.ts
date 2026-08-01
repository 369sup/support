import { authenticationServerFacade } from "./composition/authentication.composition";

export { hasSameOrigin } from "./adapters/inbound/server/same-origin.adapter";

export type {
  AuthenticatedSessionReference,
  CurrentSessionResult,
} from "./contracts/authenticated-session-reference";
export type {
  ExternalAccountProvisioningResult,
  ExternalAccountProvisioningState,
  ExternalAuthenticationProvider,
  ExternalSignInCompletionResult,
  ExternalSignInStartResult,
  SupabaseConfirmationResult,
  SupabasePasswordSignInResult,
  SupabasePasswordSignUpResult,
} from "./contracts/supabase-authentication";
export type {
  AuthenticatorAssuranceLevel,
  MfaAssuranceResult,
  MfaChallengeResult,
  MfaFactorReference,
  MfaFactorsResult,
  MfaMutationResult,
  TotpEnrollmentResult,
} from "./contracts/supabase-mfa";

export const challengeMfa = authenticationServerFacade.challengeMfa;
export const completeExternalAccountProvisioning =
  authenticationServerFacade.completeExternalAccountProvisioning;
export const completeExternalSignIn =
  authenticationServerFacade.completeExternalSignIn;
export const enrollTotp = authenticationServerFacade.enrollTotp;
export const getAuthenticatorAssuranceLevel =
  authenticationServerFacade.getAuthenticatorAssuranceLevel;
export const getCurrentAuthenticatedSession =
  authenticationServerFacade.getCurrentAuthenticatedSession;
export const getExternalAccountProvisioningState =
  authenticationServerFacade.getExternalAccountProvisioningState;
export const getOptionalCurrentSession =
  authenticationServerFacade.getOptionalCurrentSession;
export const isPasswordAuthenticationEnabled =
  authenticationServerFacade.isPasswordAuthenticationEnabled;
export const isSupabaseAuthenticationEnabled =
  authenticationServerFacade.isSupabaseAuthenticationEnabled;
export const listMfaFactors = authenticationServerFacade.listMfaFactors;
export const reauthenticate = authenticationServerFacade.reauthenticate;
export const requestSupabasePasswordReset =
  authenticationServerFacade.requestSupabasePasswordReset;
export const requireCurrentSession =
  authenticationServerFacade.requireCurrentSession;
export const signInWithPassword =
  authenticationServerFacade.signInWithPassword;
export const signOutAllSessions =
  authenticationServerFacade.signOutAllSessions;
export const signOutCurrentSession =
  authenticationServerFacade.signOutCurrentSession;
export const signOutOtherSessions =
  authenticationServerFacade.signOutOtherSessions;
export const signUpWithPassword =
  authenticationServerFacade.signUpWithPassword;
export const startExternalSignIn =
  authenticationServerFacade.startExternalSignIn;
export const unenrollMfa = authenticationServerFacade.unenrollMfa;
export const updateSupabasePassword =
  authenticationServerFacade.updateSupabasePassword;
export const verifyMfa = authenticationServerFacade.verifyMfa;
export const verifySupabaseOtp =
  authenticationServerFacade.verifySupabaseOtp;
