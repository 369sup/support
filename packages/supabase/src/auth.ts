import "server-only";

export {
  resolveSupabaseAuthConfiguration,
  type SupabaseAuthRuntimeConfiguration,
} from "./auth/configuration";
export {
  createSupabaseAuthGateway,
  type SupabaseAuthClaims,
  type SupabaseAuthFailure,
  type SupabaseAuthGateway,
  type SupabaseAuthResult,
  type SupabaseAuthUser,
  type SupabaseAuthenticatorAssurance,
  type SupabaseCookie,
  type SupabaseCookieBridge,
  type SupabaseEmailOtpType,
  type SupabaseOAuthProvider,
  type SupabaseOAuthRedirectUrl,
  type SupabaseMfaChallenge,
  type SupabaseMfaEnrollment,
  type SupabaseMfaFactor,
  type SupabaseSignUpResult,
} from "./auth/gateway";
