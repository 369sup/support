export interface DevelopmentCredentialRepositoryPort {
  authenticate(
    username: string,
    password: string,
  ): Promise<string | null>;
  authenticateAccount(accountId: string, password: string): Promise<boolean>;
}
