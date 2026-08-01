import type { ReauthenticateUseCase } from "../ports/inbound/reauthenticate.use-case";
import type { SupabaseAuthenticationGatewayPort } from "../ports/outbound/supabase-authentication.gateway.port";

export class ReauthenticateHandler implements ReauthenticateUseCase {
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "reauthenticate"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "reauthenticate"
    >,
  ) {
    this.authentication = authentication;
  }

  reauthenticate() {
    return this.authentication.reauthenticate();
  }
}
