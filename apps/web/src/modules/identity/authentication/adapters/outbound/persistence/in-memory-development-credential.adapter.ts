import type { DevelopmentCredentialRepositoryPort } from "../../../application/ports/outbound/development-credential.repository.port";

const credentials = [
  { accountId: "account_octocat", username: "octocat", password: "github" },
  { accountId: "account_hubot", username: "hubot", password: "github" },
  {
    accountId: "account_carol_acme",
    username: "carol_ACME",
    password: "github",
  },
  { accountId: "account_bob", username: "bob", password: "github" },
] as const;

export class InMemoryDevelopmentCredentialAdapter
  implements DevelopmentCredentialRepositoryPort
{
  authenticate(username: string, password: string): Promise<string | null> {
    const credential = credentials.find(
      (candidate) =>
        candidate.username === username && candidate.password === password,
    );
    return Promise.resolve(credential?.accountId ?? null);
  }

  authenticateAccount(accountId: string, password: string): Promise<boolean> {
    return Promise.resolve(
      credentials.some(
        (candidate) =>
          candidate.accountId === accountId &&
          candidate.password === password,
      ),
    );
  }
}
