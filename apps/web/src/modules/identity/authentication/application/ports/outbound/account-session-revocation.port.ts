export interface AccountSessionRevocationPort {
  revokeAccountSessions(accountId: string): Promise<void>;
}
