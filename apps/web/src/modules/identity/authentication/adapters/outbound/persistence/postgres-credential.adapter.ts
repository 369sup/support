import "server-only";

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  assertPostgresMigrationsApplied,
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type { DevelopmentCredentialRepositoryPort } from "../../../application/ports/outbound/development-credential.repository.port";
import type {
  PasswordCredentialTransactionCommand,
  PasswordCredentialTransactionRepositoryPort,
  PasswordCredentialTransactionResult,
} from "../../../application/ports/outbound/password-credential-transaction.repository.port";
import { postgresAuthenticationMigrations } from "./postgres-authentication.migrations";

type CredentialRow = SqlRow & {
  account_id: string;
  isLocked: boolean;
  username: string;
  verifier_digest: string;
  verifier_salt: string;
};

type CredentialTransactionRow = SqlRow & {
  account_id: string;
  action: "registration" | "username-change";
  previous_username: string | null;
  requested_username: string;
  state: "committed" | "prepared";
};

type CountRow = SqlRow & {
  count: string;
};

type PasswordVerifier = Readonly<{
  digest: string;
  salt: string;
}>;

function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("en-US");
}

function createVerifier(password: string): PasswordVerifier {
  const salt = randomBytes(16);
  return {
    digest: scryptSync(password, salt, 64).toString("hex"),
    salt: salt.toString("hex"),
  };
}

function verifyPassword(
  password: string,
  credential: CredentialRow,
): boolean {
  const expected = Buffer.from(credential.verifier_digest, "hex");
  const actual = scryptSync(
    password,
    Buffer.from(credential.verifier_salt, "hex"),
    expected.length,
  );
  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

function readPositiveInteger(
  name: string,
  fallback: number,
): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export class PostgresCredentialAdapter
  implements
    DevelopmentCredentialRepositoryPort,
    PasswordCredentialTransactionRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;
  private readonly ready: Promise<void>;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
    this.ready = assertPostgresMigrationsApplied(
      database,
      postgresAuthenticationMigrations,
    );
  }

  async authenticate(
    username: string,
    password: string,
  ): Promise<string | null> {
    await this.ready;
    const normalizedUsername = normalizeUsername(username);
    const credential = await this.findByUsername(normalizedUsername);
    const isRateLimited = await this.isRateLimited(
      normalizedUsername,
    );
    if (
      credential === null ||
      credential.isLocked ||
      isRateLimited
    ) {
      await this.recordAttempt(normalizedUsername, false);
      return null;
    }
    const isAuthenticated = verifyPassword(password, credential);
    await this.recordAttempt(normalizedUsername, isAuthenticated);
    return isAuthenticated ? credential.account_id : null;
  }

  async authenticateAccount(
    accountId: string,
    password: string,
  ): Promise<boolean> {
    await this.ready;
    const result = await this.database.query<CredentialRow>(
      `
        select
          account_id, is_locked as "isLocked", username,
          verifier_digest, verifier_salt
        from support_password_credentials
        where account_id = $1
      `,
      [accountId],
    );
    const credential = result.rows[0];
    if (credential === undefined) {
      return false;
    }
    const normalizedUsername = normalizeUsername(credential.username);
    const isRateLimited = await this.isRateLimited(normalizedUsername);
    const isAuthenticated =
      !isRateLimited &&
      !credential.isLocked &&
      verifyPassword(password, credential);
    await this.recordAttempt(normalizedUsername, isAuthenticated);
    return isAuthenticated;
  }

  async apply(
    command: PasswordCredentialTransactionCommand,
  ): Promise<PasswordCredentialTransactionResult> {
    await this.ready;
    if (command.action === "prepare-registration") {
      return this.prepareRegistration(command);
    }
    if (command.action === "prepare-username-change") {
      return this.prepareUsernameChange(command);
    }
    if (command.action === "commit") {
      return this.commit(command.transactionId);
    }
    if (command.action === "rollback") {
      return this.rollback(command.transactionId);
    }
    return this.finalize(command.transactionId);
  }

  private async prepareRegistration(
    command: Extract<
      PasswordCredentialTransactionCommand,
      { action: "prepare-registration" }
    >,
  ): Promise<PasswordCredentialTransactionResult> {
    if (command.password.length === 0) {
      return { status: "password-rejected" };
    }
    return this.database.transaction(async (connection) => {
      const hasConflict = await this.hasCredentialConflict(
        connection,
        command.accountId,
        command.username,
      );
      if (hasConflict) {
        return { status: "credential-conflict" };
      }
      const verifier = createVerifier(command.password);
      await connection.query(
        `
          insert into support_password_credentials (
            account_id, username, verifier_salt, verifier_digest, is_locked
          ) values ($1, $2, $3, $4, true)
        `,
        [
          command.accountId,
          command.username,
          verifier.salt,
          verifier.digest,
        ],
      );
      await connection.query(
        `
          insert into support_password_credential_transactions (
            transaction_id, action, account_id, requested_username,
            previous_username, state
          ) values ($1, 'registration', $2, $3, null, 'prepared')
        `,
        [command.transactionId, command.accountId, command.username],
      );
      return {
        status: "prepared",
        accountId: command.accountId,
        username: command.username,
      };
    });
  }

  private async prepareUsernameChange(
    command: Extract<
      PasswordCredentialTransactionCommand,
      { action: "prepare-username-change" }
    >,
  ): Promise<PasswordCredentialTransactionResult> {
    return this.database.transaction(async (connection) => {
      const credentialResult = await connection.query<CredentialRow>(
        `
          select
            account_id, is_locked as "isLocked", username,
            verifier_digest, verifier_salt
          from support_password_credentials
          where account_id = $1
          for update
        `,
        [command.accountId],
      );
      const credential = credentialResult.rows[0];
      if (credential === undefined) {
        return { status: "credential-not-found" };
      }
      const conflict = await connection.query<CountRow>(
        `
          select count(*)::text as count
          from support_password_credentials
          where lower(username) = lower($1) and account_id <> $2
        `,
        [command.newUsername, command.accountId],
      );
      if (Number(conflict.rows[0]?.count ?? "0") > 0) {
        return { status: "credential-conflict" };
      }
      await connection.query(
        `
          update support_password_credentials
          set is_locked = true, updated_at = now()
          where account_id = $1
        `,
        [command.accountId],
      );
      await connection.query(
        `
          insert into support_password_credential_transactions (
            transaction_id, action, account_id, requested_username,
            previous_username, state
          ) values ($1, 'username-change', $2, $3, $4, 'prepared')
        `,
        [
          command.transactionId,
          command.accountId,
          command.newUsername,
          credential.username,
        ],
      );
      return {
        status: "prepared",
        accountId: command.accountId,
        username: command.newUsername,
      };
    });
  }

  private async commit(
    transactionId: string,
  ): Promise<PasswordCredentialTransactionResult> {
    return this.database.transaction(async (connection) => {
      const transaction = await this.findTransaction(
        connection,
        transactionId,
      );
      if (transaction === null) {
        return { status: "transaction-not-found" };
      }
      await connection.query(
        `
          update support_password_credentials
          set username = $2, is_locked = false, updated_at = now()
          where account_id = $1
        `,
        [transaction.account_id, transaction.requested_username],
      );
      await connection.query(
        `
          update support_password_credential_transactions
          set state = 'committed'
          where transaction_id = $1
        `,
        [transactionId],
      );
      return {
        status: "committed",
        accountId: transaction.account_id,
        username: transaction.requested_username,
      };
    });
  }

  private async rollback(
    transactionId: string,
  ): Promise<PasswordCredentialTransactionResult> {
    return this.database.transaction(async (connection) => {
      const transaction = await this.findTransaction(
        connection,
        transactionId,
      );
      if (transaction === null) {
        return { status: "transaction-not-found" };
      }
      if (transaction.action === "registration") {
        await connection.query(
          "delete from support_password_credentials where account_id = $1",
          [transaction.account_id],
        );
      } else {
        await connection.query(
          `
            update support_password_credentials
            set username = $2, is_locked = false, updated_at = now()
            where account_id = $1
          `,
          [transaction.account_id, transaction.previous_username],
        );
      }
      await connection.query(
        `
          delete from support_password_credential_transactions
          where transaction_id = $1
        `,
        [transactionId],
      );
      return {
        status: "rolled-back",
        accountId: transaction.account_id,
        username:
          transaction.previous_username ??
          transaction.requested_username,
      };
    });
  }

  private async finalize(
    transactionId: string,
  ): Promise<PasswordCredentialTransactionResult> {
    return this.database.transaction(async (connection) => {
      const transaction = await this.findTransaction(
        connection,
        transactionId,
      );
      if (transaction === null) {
        return { status: "transaction-not-found" };
      }
      await connection.query(
        `
          delete from support_password_credential_transactions
          where transaction_id = $1
        `,
        [transactionId],
      );
      return {
        status: "finalized",
        accountId: transaction.account_id,
        username: transaction.requested_username,
      };
    });
  }

  private async findByUsername(
    normalizedUsername: string,
  ): Promise<CredentialRow | null> {
    const result = await this.database.query<CredentialRow>(
      `
        select
          account_id, is_locked as "isLocked", username,
          verifier_digest, verifier_salt
        from support_password_credentials
        where lower(username) = $1
      `,
      [normalizedUsername],
    );
    return result.rows[0] ?? null;
  }

  private async findTransaction(
    connection: SqlExecutor,
    transactionId: string,
  ): Promise<CredentialTransactionRow | null> {
    const result = await connection.query<CredentialTransactionRow>(
      `
        select
          account_id, action, previous_username, requested_username, state
        from support_password_credential_transactions
        where transaction_id = $1
        for update
      `,
      [transactionId],
    );
    return result.rows[0] ?? null;
  }

  private async hasCredentialConflict(
    connection: SqlExecutor,
    accountId: string,
    username: string,
  ): Promise<boolean> {
    const result = await connection.query<CountRow>(
      `
        select count(*)::text as count
        from support_password_credentials
        where account_id = $1 or lower(username) = lower($2)
      `,
      [accountId, username],
    );
    return Number(result.rows[0]?.count ?? "0") > 0;
  }

  private async isRateLimited(
    normalizedUsername: string,
  ): Promise<boolean> {
    const maximumAttempts = readPositiveInteger(
      "AUTHENTICATION_MAX_ATTEMPTS",
      5,
    );
    const windowSeconds = readPositiveInteger(
      "AUTHENTICATION_ATTEMPT_WINDOW_SECONDS",
      900,
    );
    const result = await this.database.query<CountRow>(
      `
        select count(*)::text as count
        from support_authentication_attempts
        where normalized_username = $1
          and was_successful = false
          and attempted_at >= now() - ($2 * interval '1 second')
      `,
      [normalizedUsername, windowSeconds],
    );
    return Number(result.rows[0]?.count ?? "0") >= maximumAttempts;
  }

  private async recordAttempt(
    normalizedUsername: string,
    isSuccessful: boolean,
  ): Promise<void> {
    await this.database.query(
      `
        insert into support_authentication_attempts (
          normalized_username, was_successful
        ) values ($1, $2)
      `,
      [normalizedUsername, isSuccessful],
    );
  }
}
