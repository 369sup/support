import type { VerifySupabaseOtpUseCase } from "../ports/inbound/verify-supabase-otp.use-case";
import type {
  SupabaseAuthenticationGatewayPort,
  SupabaseEmailConfirmationType,
} from "../ports/outbound/supabase-authentication.gateway.port";

export class VerifySupabaseOtpHandler implements VerifySupabaseOtpUseCase {
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "verifyOtp"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "verifyOtp"
    >,
  ) {
    this.authentication = authentication;
  }

  verifySupabaseOtp(input: {
    tokenHash: string;
    type: SupabaseEmailConfirmationType;
  }) {
    return this.authentication.verifyOtp(input);
  }
}
