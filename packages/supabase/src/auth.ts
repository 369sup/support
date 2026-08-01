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
  type SupabaseCookie,
  type SupabaseCookieBridge,
  type SupabaseEmailOtpType,
  type SupabaseOAuthProvider,
  type SupabaseOAuthRedirectUrl,
  type SupabaseSignUpResult,
} from "./auth/gateway";
