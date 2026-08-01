import type { VerifyMfaUseCase } from "../ports/inbound/verify-mfa.use-case";
import type { SupabaseAuthenticationGatewayPort } from "../ports/outbound/supabase-authentication.gateway.port";

export class VerifyMfaHandler implements VerifyMfaUseCase {
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "verifyMfa"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "verifyMfa"
    >,
  ) {
    this.authentication = authentication;
  }

  verifyMfa(input: {
    challengeId: string;
    code: string;
    factorId: string;
  }) {
    return this.authentication.verifyMfa(input);
  }
}
