import "server-only";

import {
  type SqlExecutor,
  type SqlRow,
  type TransactionalSqlExecutor,
} from "@support/database/postgres";

import type {
  AccountIdentityTransactionCommand,
  AccountIdentityTransactionRepositoryPort,
  AccountIdentityTransactionResult,
} from "../../../application/ports/outbound/account-identity-transaction.repository.port";
import type { AccountLifecycleRepositoryPort } from "../../../application/ports/outbound/account-lifecycle.repository.port";
import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../../../application/ports/outbound/account-query.repository.port";

type AccountRow = SqlRow & {
  account_id: string;
  account_type: AccountQuerySnapshot["accountType"];
  display_name: string;
  lifecycle_state: AccountQuerySnapshot["lifecycleState"];
  username: string;
  usage: AccountQuerySnapshot["usage"];
};

type AccountTransactionRow = SqlRow & {
  account_id: string;
  kind: "registration" | "username-change";
  pending_account_type: AccountQuerySnapshot["accountType"];
  pending_display_name: string;
  pending_lifecycle_state: AccountQuerySnapshot["lifecycleState"];
  pending_normalized_username: string;
  pending_username: string;
  pending_usage: AccountQuerySnapshot["usage"];
  previous_account_type: AccountQuerySnapshot["accountType"] | null;
  previous_display_name: string | null;
  previous_lifecycle_state: AccountQuerySnapshot["lifecycleState"] | null;
  previous_normalized_username: string | null;
  previous_username: string | null;
  previous_usage: AccountQuerySnapshot["usage"] | null;
  state: "committed" | "prepared";
};

type CountRow = SqlRow & {
  count: string;
};

const accountColumns = `
  account_id,
  username,
  display_name,
  account_type,
  usage,
  lifecycle_state
`;

const transactionColumns = `
  account_id,
  kind,
  state,
  pending_username,
  pending_normalized_username,
  pending_display_name,
  pending_account_type,
  pending_usage,
  pending_lifecycle_state,
  previous_username,
  previous_normalized_username,
  previous_display_name,
  previous_account_type,
  previous_usage,
  previous_lifecycle_state
`;

function normalizeUsername(username: string): string {
  return username.trim().toLocaleLowerCase("en-US");
}

function mapAccount(row: AccountRow): AccountQuerySnapshot {
  return {
    accountId: row.account_id,
    username: row.username,
    displayName: row.display_name,
    accountType: row.account_type,
    usage: row.usage,
    lifecycleState: row.lifecycle_state,
  };
}

function pendingAccount(
  transaction: AccountTransactionRow,
): AccountQuerySnapshot {
  return {
    accountId: transaction.account_id,
    username: transaction.pending_username,
    displayName: transaction.pending_display_name,
    accountType: transaction.pending_account_type,
    usage: transaction.pending_usage,
    lifecycleState: transaction.pending_lifecycle_state,
  };
}

function previousAccount(
  transaction: AccountTransactionRow,
): AccountQuerySnapshot | null {
  if (
    transaction.previous_username === null ||
    transaction.previous_display_name === null ||
    transaction.previous_account_type === null ||
    transaction.previous_usage === null ||
    transaction.previous_lifecycle_state === null
  ) {
    return null;
  }
  return {
    accountId: transaction.account_id,
    username: transaction.previous_username,
    displayName: transaction.previous_display_name,
    accountType: transaction.previous_account_type,
    usage: transaction.previous_usage,
    lifecycleState: transaction.previous_lifecycle_state,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function lockUsername(
  connection: SqlExecutor,
  normalizedUsername: string,
): Promise<void> {
  await connection.query(
    "select pg_advisory_xact_lock(hashtext($1))",
    [`support-account-username:${normalizedUsername}`],
  );
}

export class PostgresAccountAdapter
  implements
    AccountQueryRepositoryPort,
    AccountLifecycleRepositoryPort,
    AccountIdentityTransactionRepositoryPort
{
  private readonly database: TransactionalSqlExecutor;

  constructor(database: TransactionalSqlExecutor) {
    this.database = database;
  }

  async findByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    const result = await this.database.query<AccountRow>(
      `
        select ${accountColumns}
        from support_identity_accounts.support_accounts
        where normalized_username = $1
      `,
      [normalizeUsername(username)],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapAccount(row);
  }

  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null> {
    return this.findByUsername(username);
  }

  async findById(
    accountId: string,
  ): Promise<AccountQuerySnapshot | null> {
    const result = await this.database.query<AccountRow>(
      `
        select ${accountColumns}
        from support_identity_accounts.support_accounts
        where account_id = $1
      `,
      [accountId],
    );
    const row = result.rows[0];
    return row === undefined ? null : mapAccount(row);
  }

  async markDeleted(accountId: string): Promise<void> {
    await this.database.query(
      `
        update support_identity_accounts.support_accounts
        set lifecycle_state = 'deleted', updated_at = now()
        where account_id = $1
      `,
      [accountId],
    );
  }

  async apply(
    command: AccountIdentityTransactionCommand,
  ): Promise<AccountIdentityTransactionResult> {
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
      AccountIdentityTransactionCommand,
      { action: "prepare-registration" }
    >,
  ): Promise<AccountIdentityTransactionResult> {
    if (
      command.account.accountType !== "personal" ||
      command.account.usage !== "human" ||
      command.account.lifecycleState !== "pending"
    ) {
      return { status: "invalid-account" };
    }

    const normalizedUsername = normalizeUsername(command.account.username);
    try {
      return await this.database.transaction(async (connection) => {
        await lockUsername(connection, normalizedUsername);
        if (
          await this.hasIdentityConflict(
            connection,
            command.account.accountId,
            normalizedUsername,
            false,
          )
        ) {
          return { status: "username-conflict" };
        }
        await connection.query(
          `
            insert into support_identity_accounts.support_account_identity_transactions (
              transaction_id, kind, state, account_id,
              pending_username, pending_normalized_username,
              pending_display_name, pending_account_type, pending_usage,
              pending_lifecycle_state
            ) values (
              $1, 'registration', 'prepared', $2,
              $3, $4, $5, $6, $7, $8
            )
          `,
          [
            command.transactionId,
            command.account.accountId,
            command.account.username,
            normalizedUsername,
            command.account.displayName,
            command.account.accountType,
            command.account.usage,
            command.account.lifecycleState,
          ],
        );
        return { status: "prepared", account: command.account };
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { status: "username-conflict" };
      }
      throw error;
    }
  }

  private async prepareUsernameChange(
    command: Extract<
      AccountIdentityTransactionCommand,
      { action: "prepare-username-change" }
    >,
  ): Promise<AccountIdentityTransactionResult> {
    if (command.actorAccountId !== command.accountId) {
      return { status: "permission-denied" };
    }
    const normalizedUsername = normalizeUsername(command.newUsername);
    try {
      return await this.database.transaction(async (connection) => {
        await lockUsername(connection, normalizedUsername);
        const result = await connection.query<AccountRow>(
          `
            select ${accountColumns}
            from support_identity_accounts.support_accounts
            where account_id = $1 and lifecycle_state = 'active'
            for update
          `,
          [command.accountId],
        );
        const row = result.rows[0];
        if (row === undefined) {
          return { status: "account-not-found" };
        }
        const account = mapAccount(row);
        if (account.accountType !== "personal" || account.usage !== "human") {
          return { status: "unsupported-account-type" };
        }
        if (
          await this.hasIdentityConflict(
            connection,
            command.accountId,
            normalizedUsername,
            true,
          )
        ) {
          return { status: "username-conflict" };
        }
        const pending: AccountQuerySnapshot = {
          ...account,
          username: command.newUsername,
        };
        await connection.query(
          `
            insert into support_identity_accounts.support_account_identity_transactions (
              transaction_id, kind, state, account_id,
              pending_username, pending_normalized_username,
              pending_display_name, pending_account_type, pending_usage,
              pending_lifecycle_state, previous_username,
              previous_normalized_username, previous_display_name,
              previous_account_type, previous_usage,
              previous_lifecycle_state
            ) values (
              $1, 'username-change', 'prepared', $2,
              $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )
          `,
          [
            command.transactionId,
            account.accountId,
            pending.username,
            normalizedUsername,
            pending.displayName,
            pending.accountType,
            pending.usage,
            pending.lifecycleState,
            account.username,
            normalizeUsername(account.username),
            account.displayName,
            account.accountType,
            account.usage,
            account.lifecycleState,
          ],
        );
        return { status: "prepared", account: pending };
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { status: "username-conflict" };
      }
      throw error;
    }
  }

  private async commit(
    transactionId: string,
  ): Promise<AccountIdentityTransactionResult> {
    return this.database.transaction(async (connection) => {
      const transaction = await this.findTransaction(
        connection,
        transactionId,
      );
      if (transaction === null) {
        return { status: "transaction-not-found" };
      }
      await lockUsername(
        connection,
        transaction.pending_normalized_username,
      );
      const committed = {
        ...pendingAccount(transaction),
        lifecycleState: "active" as const,
      };
      if (transaction.kind === "registration") {
        await connection.query(
          `
            insert into support_identity_accounts.support_accounts (
              account_id, username, normalized_username, display_name,
              account_type, usage, lifecycle_state
            ) values ($1, $2, $3, $4, $5, $6, 'active')
            on conflict (account_id) do update
            set username = excluded.username,
                normalized_username = excluded.normalized_username,
                display_name = excluded.display_name,
                account_type = excluded.account_type,
                usage = excluded.usage,
                lifecycle_state = 'active',
                updated_at = now()
          `,
          [
            committed.accountId,
            committed.username,
            transaction.pending_normalized_username,
            committed.displayName,
            committed.accountType,
            committed.usage,
          ],
        );
      } else {
        await connection.query(
          `
            update support_identity_accounts.support_accounts
            set username = $2,
                normalized_username = $3,
                lifecycle_state = 'active',
                updated_at = now()
            where account_id = $1
          `,
          [
            committed.accountId,
            committed.username,
            transaction.pending_normalized_username,
          ],
        );
      }
      await connection.query(
        `
          update support_identity_accounts.support_account_identity_transactions
          set state = 'committed'
          where transaction_id = $1
        `,
        [transactionId],
      );
      return { status: "committed", account: committed };
    });
  }

  private async rollback(
    transactionId: string,
  ): Promise<AccountIdentityTransactionResult> {
    return this.database.transaction(async (connection) => {
      const transaction = await this.findTransaction(
        connection,
        transactionId,
      );
      if (transaction === null) {
        return { status: "transaction-not-found" };
      }
      const usernames = [
        transaction.pending_normalized_username,
        transaction.previous_normalized_username,
      ]
        .filter((username): username is string => username !== null)
        .sort();
      for (const username of usernames) {
        await lockUsername(connection, username);
      }
      if (transaction.state === "committed") {
        const previous = previousAccount(transaction);
        if (transaction.kind === "registration") {
          await connection.query(
            "delete from support_identity_accounts.support_accounts where account_id = $1",
            [transaction.account_id],
          );
        } else if (previous !== null) {
          await connection.query(
            `
              update support_identity_accounts.support_accounts
              set username = $2,
                  normalized_username = $3,
                  display_name = $4,
                  account_type = $5,
                  usage = $6,
                  lifecycle_state = $7,
                  updated_at = now()
              where account_id = $1
            `,
            [
              previous.accountId,
              previous.username,
              transaction.previous_normalized_username,
              previous.displayName,
              previous.accountType,
              previous.usage,
              previous.lifecycleState,
            ],
          );
        }
      }
      await connection.query(
        `
          delete from support_identity_accounts.support_account_identity_transactions
          where transaction_id = $1
        `,
        [transactionId],
      );
      return {
        status: "rolled-back",
        account: pendingAccount(transaction),
      };
    });
  }

  private async finalize(
    transactionId: string,
  ): Promise<AccountIdentityTransactionResult> {
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
          delete from support_identity_accounts.support_account_identity_transactions
          where transaction_id = $1
        `,
        [transactionId],
      );
      return {
        status: "finalized",
        account: pendingAccount(transaction),
      };
    });
  }

  private async findTransaction(
    connection: SqlExecutor,
    transactionId: string,
  ): Promise<AccountTransactionRow | null> {
    const result = await connection.query<AccountTransactionRow>(
      `
        select ${transactionColumns}
        from support_identity_accounts.support_account_identity_transactions
        where transaction_id = $1
        for update
      `,
      [transactionId],
    );
    return result.rows[0] ?? null;
  }

  private async hasIdentityConflict(
    connection: SqlExecutor,
    accountId: string,
    normalizedUsername: string,
    canUseExistingAccount: boolean,
  ): Promise<boolean> {
    const result = await connection.query<CountRow>(
      `
        select (
          (
            select count(*)
            from support_identity_accounts.support_accounts
            where (
              account_id = $1 and $3 = false
            ) or (
              normalized_username = $2 and account_id <> $1
            )
          ) + (
            select count(*)
            from support_identity_accounts.support_account_identity_transactions
            where account_id = $1 or pending_normalized_username = $2
          )
        )::text as count
      `,
      [accountId, normalizedUsername, canUseExistingAccount],
    );
    return Number(result.rows[0]?.count ?? "0") > 0;
  }
}
