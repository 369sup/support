import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../../../application/ports/outbound/account-query.repository.port";

const developmentAccounts: readonly AccountQuerySnapshot[] = [
  {
    accountId: "account_octocat",
    username: "octocat",
    displayName: "The Octocat",
    accountType: "personal",
    usage: "human",
    lifecycleState: "active",
  },
  {
    accountId: "account_hubot",
    username: "hubot",
    displayName: "Hubot",
    accountType: "personal",
    usage: "machine",
    lifecycleState: "active",
  },
  {
    accountId: "account_carol_acme",
    username: "carol_ACME",
    displayName: "Carol",
    accountType: "managed",
    usage: "human",
    lifecycleState: "active",
  },
  {
    accountId: "account_bob",
    username: "bob",
    displayName: "Bob",
    accountType: "personal",
    usage: "human",
    lifecycleState: "active",
  },
];

type AccountStore = Readonly<{
  byId: Map<string, AccountQuerySnapshot>;
  accountIdByUsername: Map<string, string>;
}>;

declare global {
  var __supportAccountStoreV1: AccountStore | undefined;
}

function createStore(
  accounts: readonly AccountQuerySnapshot[],
): AccountStore {
  return {
    byId: new Map(accounts.map((account) => [account.accountId, account])),
    accountIdByUsername: new Map(
      accounts.map((account) => [account.username, account.accountId]),
    ),
  };
}

function getProcessStore(): AccountStore {
  globalThis.__supportAccountStoreV1 ??= createStore(developmentAccounts);
  return globalThis.__supportAccountStoreV1;
}

export class InMemoryAccountQueryAdapter
  implements AccountQueryRepositoryPort
{
  private readonly store: AccountStore;

  constructor(
    accounts?: readonly AccountQuerySnapshot[],
  ) {
    this.store =
      accounts === undefined ? getProcessStore() : createStore(accounts);
  }

  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    const accountId = this.store.accountIdByUsername.get(username);
    return Promise.resolve(
      accountId === undefined ? null : (this.store.byId.get(accountId) ?? null),
    );
  }

  findById(accountId: string): Promise<AccountQuerySnapshot | null> {
    return Promise.resolve(this.store.byId.get(accountId) ?? null);
  }
}
