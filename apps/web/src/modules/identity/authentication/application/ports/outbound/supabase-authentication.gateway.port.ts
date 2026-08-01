import type {
  SupabaseMfaUpdateGatewayResult,
  SupabaseEmailConfirmationType,
  SupabaseOtpVerificationGatewayResult,
  SupabaseTotpEnrollmentGatewayResult,
} from "../../supabase-authentication-results";

export type { SupabaseEmailConfirmationType } from "../../supabase-authentication-results";

export interface SupabaseAuthenticationGatewayPort {
  enrollTotp(
    friendlyName?: string,
  ): Promise<SupabaseTotpEnrollmentGatewayResult>;
  reauthenticate(): Promise<SupabaseMfaUpdateGatewayResult>;
  requestPasswordReset(input: {
    email: string;
    redirectTo: string;
  }): Promise<void>;
  updatePassword(password: string): Promise<boolean>;
  verifyMfa(input: {
    challengeId: string;
    code: string;
    factorId: string;
  }): Promise<SupabaseMfaUpdateGatewayResult>;
  verifyOtp(input: {
    tokenHash: string;
    type: SupabaseEmailConfirmationType;
  }): Promise<SupabaseOtpVerificationGatewayResult>;
}
