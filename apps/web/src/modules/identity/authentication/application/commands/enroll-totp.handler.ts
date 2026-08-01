import type { EnrollTotpUseCase } from "../ports/inbound/enroll-totp.use-case";
import type { SupabaseAuthenticationGatewayPort } from "../ports/outbound/supabase-authentication.gateway.port";

export class EnrollTotpHandler implements EnrollTotpUseCase {
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "enrollTotp"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "enrollTotp"
    >,
  ) {
    this.authentication = authentication;
  }

  enrollTotp(friendlyName?: string) {
    return this.authentication.enrollTotp(friendlyName);
  }
}
