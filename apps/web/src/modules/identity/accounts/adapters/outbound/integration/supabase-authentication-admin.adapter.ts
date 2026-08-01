import type { SupabaseAuthAdminGateway } from "@support/supabase/auth/admin";

import type { AuthenticationAdminGatewayPort } from "../../../application/ports/outbound/authentication-admin.gateway.port";

export class SupabaseAuthenticationAdminAdapter
  implements AuthenticationAdminGatewayPort
{
  private readonly gateway: SupabaseAuthAdminGateway;

  constructor(gateway: SupabaseAuthAdminGateway) {
    this.gateway = gateway;
  }

  async deleteAuthenticationUser(
    supabaseUserId: string,
  ): Promise<boolean> {
    const result = await this.gateway.deleteUser(supabaseUserId);
    return result.error === null;
  }
}
