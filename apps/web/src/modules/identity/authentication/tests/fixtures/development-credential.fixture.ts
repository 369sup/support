import "server-only";

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import type { DevelopmentCredentialRepositoryPort } from "../../application/ports/outbound/development-credential.repository.port";
import type {
  PasswordCredentialTransactionCommand,
  PasswordCredentialTransactionRepositoryPort,
  PasswordCredentialTransactionResult,
} from "../../application/ports/outbound/password-credential-transaction.repository.port";

type PasswordVerifier = Readonly<{
  kind: "scrypt";
  salt: string;
  digest: string;
}>;

type CredentialRecord = Readonly<{
  accountId: string;
  username: string;
  passwordVerifier: PasswordVerifier;
  isLocked: boolean;
}>;

type CredentialTransaction = Readonly<{
  transactionId: string;
  kind: "registration" | "username-change";
  credential: CredentialRecord;
  previousCredential: CredentialRecord | null;
}>;

type CredentialStore = {
  byAccountId: Map<string, CredentialRecord>;
  accountIdByUsername: Map<string, string>;
  transactionById: Map<string, CredentialTransaction>;
};

const developmentAccounts = [
  { accountId: "account_mock", username: "mock" },
  { accountId: "account_octocat", username: "octocat" },
  { accountId: "account_hubot", username: "hubot" },
  {
    accountId: "account_carol_acme",
    username: "carol_ACME",
  },
  { accountId: "account_bob", username: "bob" },
] as const;

declare global {
  var __supportDevelopmentCredentialStoreV3: CredentialStore | undefined;
}

function normalizeUsername(username: string) {
  return username.toLocaleLowerCase("en-US");
}

function createStore(developmentPassword: string): CredentialStore {
  const records =
    developmentPassword.length === 0
      ? []
      : developmentAccounts.map<CredentialRecord>((account) => ({
          accountId: account.accountId,
          username: account.username,
          passwordVerifier: createScryptVerifier(developmentPassword),
          isLocked: false,
        }));
  return {
    byAccountId: new Map(
      records.map((credential) => [credential.accountId, credential]),
    ),
    accountIdByUsername: new Map(
      records.map((credential) => [
        normalizeUsername(credential.username),
        credential.accountId,
      ]),
    ),
    transactionById: new Map(),
  };
}

function getProcessStore(developmentPassword: string) {
  globalThis.__supportDevelopmentCredentialStoreV3 ??=
    createStore(developmentPassword);
  return globalThis.__supportDevelopmentCredentialStoreV3;
}

function createScryptVerifier(password: string): PasswordVerifier {
  const salt = randomBytes(16);
  return {
    kind: "scrypt",
    salt: salt.toString("hex"),
    digest: scryptSync(password, salt, 64).toString("hex"),
  };
}

function verifyPassword(
  password: string,
  verifier: PasswordVerifier,
): boolean {
  const actual = scryptSync(
    password,
    Buffer.from(verifier.salt, "hex"),
    64,
  );
  const expected = Buffer.from(verifier.digest, "hex");
  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

export class InMemoryDevelopmentCredentialAdapter
  implements
    DevelopmentCredentialRepositoryPort,
    PasswordCredentialTransactionRepositoryPort
{
  private readonly store: CredentialStore;
  private readonly isDevelopmentAuthenticationConfigured: boolean;

  constructor(developmentPassword: string) {
    this.isDevelopmentAuthenticationConfigured =
      developmentPassword.length > 0;
    this.store = getProcessStore(developmentPassword);
  }

  isConfigured(): boolean {
    return this.isDevelopmentAuthenticationConfigured;
  }

  authenticate(username: string, password: string): Promise<string | null> {
    const accountId = this.store.accountIdByUsername.get(
      normalizeUsername(username),
    );
    const credential =
      accountId === undefined
        ? undefined
        : this.store.byAccountId.get(accountId);
    return Promise.resolve(
      credential !== undefined &&
        !credential.isLocked &&
        verifyPassword(password, credential.passwordVerifier)
        ? credential.accountId
        : null,
    );
  }

  authenticateAccount(accountId: string, password: string): Promise<boolean> {
    const credential = this.store.byAccountId.get(accountId);
    return Promise.resolve(
      credential !== undefined &&
        !credential.isLocked &&
        verifyPassword(password, credential.passwordVerifier),
    );
  }

  apply(
    command: PasswordCredentialTransactionCommand,
  ): Promise<PasswordCredentialTransactionResult> {
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
      PasswordCredentialTransactionCommand,
      { action: "prepare-registration" }
    >,
  ): PasswordCredentialTransactionResult {
    if (command.password.length === 0) {
      return { status: "password-rejected" };
    }
    if (
      this.store.byAccountId.has(command.accountId) ||
      this.store.accountIdByUsername.has(normalizeUsername(command.username))
    ) {
      return { status: "credential-conflict" };
    }
    const credential: CredentialRecord = {
      accountId: command.accountId,
      username: command.username,
      passwordVerifier: createScryptVerifier(command.password),
      isLocked: true,
    };
    this.store.transactionById.set(command.transactionId, {
      transactionId: command.transactionId,
      kind: "registration",
      credential,
      previousCredential: null,
    });
    return {
      status: "prepared",
      accountId: credential.accountId,
      username: credential.username,
    };
  }

  private prepareUsernameChange(
    command: Extract<
      PasswordCredentialTransactionCommand,
      { action: "prepare-username-change" }
    >,
  ): PasswordCredentialTransactionResult {
    const credential = this.store.byAccountId.get(command.accountId);
    if (credential === undefined) {
      return { status: "credential-not-found" };
    }
    const usernameOwner = this.store.accountIdByUsername.get(
      normalizeUsername(command.newUsername),
    );
    if (usernameOwner !== undefined && usernameOwner !== command.accountId) {
      return { status: "credential-conflict" };
    }
    const lockedCredential: CredentialRecord = {
      ...credential,
      username: command.newUsername,
      isLocked: true,
    };
    this.store.byAccountId.set(credential.accountId, {
      ...credential,
      isLocked: true,
    });
    this.store.transactionById.set(command.transactionId, {
      transactionId: command.transactionId,
      kind: "username-change",
      credential: lockedCredential,
      previousCredential: credential,
    });
    return {
      status: "prepared",
      accountId: credential.accountId,
      username: command.newUsername,
    };
  }

  private commitTransaction(
    transactionId: string,
  ): PasswordCredentialTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    if (transaction.previousCredential !== null) {
      this.store.accountIdByUsername.delete(
        normalizeUsername(transaction.previousCredential.username),
      );
    }
    const committed = {
      ...transaction.credential,
      isLocked: false,
    };
    this.store.byAccountId.set(committed.accountId, committed);
    this.store.accountIdByUsername.set(
      normalizeUsername(committed.username),
      committed.accountId,
    );
    return {
      status: "committed",
      accountId: committed.accountId,
      username: committed.username,
    };
  }

  private rollbackTransaction(
    transactionId: string,
  ): PasswordCredentialTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    if (transaction.previousCredential === null) {
      this.store.byAccountId.delete(transaction.credential.accountId);
      this.store.accountIdByUsername.delete(
        normalizeUsername(transaction.credential.username),
      );
    } else {
      this.store.accountIdByUsername.delete(
        normalizeUsername(transaction.credential.username),
      );
      this.store.byAccountId.set(
        transaction.previousCredential.accountId,
        transaction.previousCredential,
      );
      this.store.accountIdByUsername.set(
        normalizeUsername(transaction.previousCredential.username),
        transaction.previousCredential.accountId,
      );
    }
    this.store.transactionById.delete(transactionId);
    return {
      status: "rolled-back",
      accountId: transaction.credential.accountId,
      username: transaction.credential.username,
    };
  }

  private finalizeTransaction(
    transactionId: string,
  ): PasswordCredentialTransactionResult {
    const transaction = this.store.transactionById.get(transactionId);
    if (transaction === undefined) {
      return { status: "transaction-not-found" };
    }
    this.store.transactionById.delete(transactionId);
    return {
      status: "finalized",
      accountId: transaction.credential.accountId,
      username: transaction.credential.username,
    };
  }
}
