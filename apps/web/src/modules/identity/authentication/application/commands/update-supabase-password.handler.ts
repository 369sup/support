import type { UpdateSupabasePasswordUseCase } from "../ports/inbound/update-supabase-password.use-case";
import type { SupabaseAuthenticationGatewayPort } from "../ports/outbound/supabase-authentication.gateway.port";

export class UpdateSupabasePasswordHandler
  implements UpdateSupabasePasswordUseCase
{
  private readonly authentication: Pick<
    SupabaseAuthenticationGatewayPort,
    "updatePassword"
  >;

  constructor(
    authentication: Pick<
      SupabaseAuthenticationGatewayPort,
      "updatePassword"
    >,
  ) {
    this.authentication = authentication;
  }

  async updateSupabasePassword(password: string) {
    return (await this.authentication.updatePassword(password))
      ? ({ status: "changed" } as const)
      : ({ status: "service-unavailable" } as const);
  }
}
