import type { RequestSupabasePasswordResetUseCase } from "../ports/inbound/request-supabase-password-reset.use-case";
import type { SupabaseAuthenticationGatewayPort } from "../ports/outbound/supabase-authentication.gateway.port";

export class RequestSupabasePasswordResetHandler
  implements RequestSupabasePasswordResetUseCase
{
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "requestPasswordReset"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "requestPasswordReset"
    >,
  ) {
    this.authentication = authentication;
  }

  async requestSupabasePasswordReset(input: {
    email: string;
    redirectTo: string;
  }) {
    await this.authentication.requestPasswordReset(input);
    return { status: "requested" } as const;
  }
}
