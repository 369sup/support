import type {
  SupabaseEmailConfirmationType,
} from "../../supabase-authentication-results";

export type VerifySupabaseOtpResult =
  | Readonly<{ status: "confirmed" }>
  | Readonly<{
      status: "invalid-confirmation" | "service-unavailable";
    }>;

export interface VerifySupabaseOtpUseCase {
  verifySupabaseOtp(input: {
    tokenHash: string;
    type: SupabaseEmailConfirmationType;
  }): Promise<VerifySupabaseOtpResult>;
}
