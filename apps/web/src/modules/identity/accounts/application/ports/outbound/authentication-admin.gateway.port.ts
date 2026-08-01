export interface AuthenticationAdminGatewayPort {
  deleteAuthenticationUser(supabaseUserId: string): Promise<boolean>;
}
