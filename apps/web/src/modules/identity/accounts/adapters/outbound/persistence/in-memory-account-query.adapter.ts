import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../../../application/ports/outbound/account-query.repository.port";

const developmentAccounts: readonly AccountQuerySnapshot[] = [
  {
    accountId: "account_octocat",
    username: "octocat",
    accountKind: "personal",
    lifecycleState: "active",
  },
];

export class InMemoryAccountQueryAdapter
  implements AccountQueryRepositoryPort
{
  private readonly accounts: readonly AccountQuerySnapshot[];

  constructor(
    accounts: readonly AccountQuerySnapshot[] = developmentAccounts,
  ) {
    this.accounts = accounts;
  }

  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    const account =
      this.accounts.find(
        (candidate) => candidate.username === username,
      ) ?? null;

    return Promise.resolve(account);
  }
}
