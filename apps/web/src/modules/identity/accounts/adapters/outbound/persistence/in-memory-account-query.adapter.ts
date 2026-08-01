import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../../../application/ports/outbound/account-query.repository.port";
import type { AccountLifecycleRepositoryPort } from "../../../application/ports/outbound/account-lifecycle.repository.port";
import type {
  AccountIdentityTransactionCommand,
  AccountIdentityTransactionRepositoryPort,
  AccountIdentityTransactionResult,
} from "../../../application/ports/outbound/account-identity-transaction.repository.port";

const developmentAccounts: readonly AccountQuerySnapshot[] = [
  {
    accountId: "account_mock",
    username: "mock",
    displayName: "Mock User",
    accountType: "personal",
    usage: "human",
    lifecycleState: "active",
  },
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

type AccountIdentityTransaction = Readonly<{
  transactionId: string;
  kind: "registration" | "username-change";
  account: AccountQuerySnapshot;
  previousAccount: AccountQuerySnapshot | null;
  reservedUsername: string;
}>;

type AccountStore = {
  byId: Map<string, AccountQuerySnapshot>;
  accountIdByUsername: Map<string, string>;
  transactionById: Map<string, AccountIdentityTransaction>;
};

declare global {
  var __supportAccountStoreV2: AccountStore | undefined;
}

function createStore(
  accounts: readonly AccountQuerySnapshot[],
): AccountStore {
  return {
    byId: new Map(accounts.map((account) => [account.accountId, account])),
    accountIdByUsername: new Map(
      accounts.map((account) => [
        account.username.toLocaleLowerCase("en-US"),
        account.accountId,
      ]),
    ),
    transactionById: new Map(),
  };
}

function getProcessStore(): AccountStore {
  globalThis.__supportAccountStoreV2 ??= createStore(developmentAccounts);
  return globalThis.__supportAccountStoreV2;
}

export class InMemoryAccountQueryAdapter
  implements
    AccountQueryRepositoryPort,
    AccountLifecycleRepositoryPort,
    AccountIdentityTransactionRepositoryPort
{
  private readonly store: AccountStore;

  constructor(
    accounts?: readonly AccountQuerySnapshot[],
  ) {
    this.store =
      accounts === undefined ? getProcessStore() : createStore(accounts);
  }

  findByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    const accountId = this.store.accountIdByUsername.get(
      username.toLocaleLowerCase("en-US"),
    );
    const account =
      accountId === undefined ? undefined : this.store.byId.get(accountId);
    return Promise.resolve(
      account !== undefined &&
        normalizeUsername(account.username) === normalizeUsername(username)
        ? account
        : null,
    );
  }

  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    return this.findByUsername(username);
  }

  findById(accountId: string): Promise<AccountQuerySnapshot | null> {
    return Promise.resolve(this.store.byId.get(accountId) ?? null);
  }

  markDeleted(accountId: string): Promise<void> {
    const account = this.store.byId.get(accountId);
    if (account !== undefined) {
      this.store.byId.set(accountId, {
        ...account,
        lifecycleState: "deleted",
      });
    }
    return Promise.resolve();
  }

  apply(
    command: AccountIdentityTransactionCommand,
  ): Promise<AccountIdentityTransactionResult> {
    if (command.action === "prepare-registration") {
      return Promise.resolve(this.prepareRegistration(command));
    }
    if (command.action === "prepare-username-change") {
      return Promise.resolve(this.prepareUsernameChange(command));
    }
    if (command.action === "finalize") {
      return Promise.resolve(this.finalizeTransaction(command.transactionId));
    }
    return Promise.resolve(
      command.action === "commit"
        ? this.commitTransaction(command.transactionId)
        : this.rollbackTransaction(command.transactionId),
    );
  }

  private prepareRegistration(
    command: Extract<
      AccountIdentityTransactionCommand,
      { action: "prepare-registration" }
    >,
  ): AccountIdentityTransactionResult {
    const usernameKey = normalizeUsername(command.account.username);
    if (
      command.account.accountType !== "personal" ||
      command.account.usage !== "human" ||
      command.account.lifecycleState !== "pending"
    ) {
      return { status: "invalid-account" };
    }
    if (
      this.store.byId.has(command.account.accountId) ||
      this.store.accountIdByUsername.has(usernameKey)
    ) {
      return { status: "username-conflict" };
    }
    this.store.accountIdByUsername.set(
      usernameKey,
      command.account.accountId,
    );
    this.store.transactionById.set(command.transactionId, {
      transactionId: command.transactionId,
      kind: "registration",
      account: command.account,
      previousAccount: null,
      reservedUsername: usernameKey,
    });
    return { status: "prepared", account: command.account };
  }

  private prepareUsernameChange(
    command: Extract<
      AccountIdentityTransactionCommand,
      { action: "prepare-username-change" }
    >,
  ): AccountIdentityTransactionResult {
    const account = this.store.byId.get(command.accountId);
    if (account === undefined || account.lifecycleState !== "active") {
      return { status: "account-not-found" };
    }
    if (command.actorAccountId !== account.accountId) {
      return { status: "permission-denied" };
    }
    if (account.accountType !== "personal" || account.usage !== "human") {
      return { status: "unsupported-account-type" };
    }
    const usernameKey = normalizeUsername(command.newUsername);
    const currentOwner = this.store.accountIdByUsername.get(usernameKey);
    if (currentOwner !== undefined && currentOwner !== account.accountId) {
      return { status: "username-conflict" };
    }
    this.store.accountIdByUsername.set(usernameKey, account.accountId);
    const pendingAccount: AccountQuerySnapshot = {
      ...account,
      username: command.newUsername,
    };
    this.store.transactionById.set(command.transactionId, {
      transactionId: command.transactionId,
      kind: "username-change",
      account: pendingAccount,
      previousAccount: account,
      reservedUsername: usernameKey,
    });
    return { status: "prepared", account: pendingAccount };
  }

  private commitTransaction(
    transactionId: string,
  ): AccountIdentityTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    const committed: AccountQuerySnapshot = {
      ...transaction.account,
      lifecycleState: "active",
    };
    if (transaction.previousAccount !== null) {
      this.store.accountIdByUsername.delete(
        normalizeUsername(transaction.previousAccount.username),
      );
    }
    this.store.byId.set(committed.accountId, committed);
    this.store.accountIdByUsername.set(
      normalizeUsername(committed.username),
      committed.accountId,
    );
    return { status: "committed", account: committed };
  }

  private rollbackTransaction(
    transactionId: string,
  ): AccountIdentityTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    this.store.accountIdByUsername.delete(transaction.reservedUsername);
    if (transaction.previousAccount === null) {
      this.store.byId.delete(transaction.account.accountId);
    } else {
      this.store.byId.set(
        transaction.previousAccount.accountId,
        transaction.previousAccount,
      );
      this.store.accountIdByUsername.set(
        normalizeUsername(transaction.previousAccount.username),
        transaction.previousAccount.accountId,
      );
    }
    this.store.transactionById.delete(transactionId);
    return { status: "rolled-back", account: transaction.account };
  }

  private finalizeTransaction(
    transactionId: string,
  ): AccountIdentityTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    this.store.transactionById.delete(transactionId);
    return { status: "finalized", account: transaction.account };
  }
}

function normalizeUsername(username: string): string {
  return username.toLocaleLowerCase("en-US");
}
