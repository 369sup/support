import type {
  SqlQueryResult,
  SqlRow,
  SqlValue,
  TransactionalSqlExecutor,
} from "@support/database/postgres";
import { describe, expect, it } from "vitest";

import type { AccountQuerySnapshot } from "../application/ports/outbound/account-query.repository.port";
import { PostgresAccountAdapter } from "../adapters/outbound/persistence/postgres-account.adapter";

type ScriptStep = Readonly<{
  contains: string;
  error?: Error;
  result?: SqlQueryResult<SqlRow>;
  values?: readonly SqlValue[];
}>;

class ScriptedDatabase implements TransactionalSqlExecutor {
  private readonly steps: ScriptStep[];

  constructor(steps: readonly ScriptStep[]) {
    this.steps = [...steps];
  }

  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>>;
  query(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<SqlRow>> {
    const step = this.steps.shift();
    expect(step, `Unexpected query: ${text}`).toBeDefined();
    expect(text).toContain(step?.contains);
    if (step?.values !== undefined) {
      expect(values).toEqual(step.values);
    }
    if (step?.error !== undefined) {
      throw step.error;
    }
    return Promise.resolve(step?.result ?? {
      rowCount: 0,
      rows: [],
    });
  }

  transaction<Result>(
    work: (connection: this) => Promise<Result>,
  ): Promise<Result> {
    return work(this);
  }

  expectComplete(): void {
    expect(this.steps).toEqual([]);
  }
}

function queryResult<Row extends SqlRow>(
  ...rows: readonly Row[]
): SqlQueryResult<Row> {
  return { rowCount: rows.length, rows };
}

const pendingAccount: AccountQuerySnapshot = {
  accountId: "account-1",
  username: "OctoCat",
  displayName: "The Octocat",
  accountType: "personal",
  usage: "human",
  lifecycleState: "pending",
};

const registrationTransaction = {
  account_id: pendingAccount.accountId,
  kind: "registration",
  state: "prepared",
  pending_username: pendingAccount.username,
  pending_normalized_username: "octocat",
  pending_display_name: pendingAccount.displayName,
  pending_account_type: pendingAccount.accountType,
  pending_usage: pendingAccount.usage,
  pending_lifecycle_state: pendingAccount.lifecycleState,
  previous_username: null,
  previous_normalized_username: null,
  previous_display_name: null,
  previous_account_type: null,
  previous_usage: null,
  previous_lifecycle_state: null,
} as const;

describe("PostgresAccountAdapter", () => {
  it("prepares a registration with a normalized username reservation", async () => {
    const database = new ScriptedDatabase([
      { contains: "pg_advisory_xact_lock" },
      {
        contains: "from support_identity_accounts.support_accounts",
        result: queryResult({ count: "0" }),
        values: ["account-1", "octocat", false],
      },
      {
        contains: "insert into support_identity_accounts.support_account_identity_transactions",
        values: [
          "transaction-1",
          "account-1",
          "OctoCat",
          "octocat",
          "The Octocat",
          "personal",
          "human",
          "pending",
        ],
      },
    ]);
    const adapter = new PostgresAccountAdapter(database);

    await expect(
      adapter.apply({
        action: "prepare-registration",
        transactionId: "transaction-1",
        account: pendingAccount,
      }),
    ).resolves.toEqual({ status: "prepared", account: pendingAccount });
    database.expectComplete();
  });

  it("maps a concurrent unique reservation to username-conflict", async () => {
    const database = new ScriptedDatabase([
      { contains: "pg_advisory_xact_lock" },
      {
        contains: "from support_identity_accounts.support_accounts",
        result: queryResult({ count: "0" }),
      },
      {
        contains: "insert into support_identity_accounts.support_account_identity_transactions",
        error: Object.assign(new Error("unique violation"), {
          code: "23505",
        }),
      },
    ]);
    const adapter = new PostgresAccountAdapter(database);

    await expect(
      adapter.apply({
        action: "prepare-registration",
        transactionId: "transaction-2",
        account: pendingAccount,
      }),
    ).resolves.toEqual({ status: "username-conflict" });
    database.expectComplete();
  });

  it("commits a prepared registration as an active account", async () => {
    const database = new ScriptedDatabase([
      {
        contains: "from support_identity_accounts.support_account_identity_transactions",
        result: queryResult(registrationTransaction),
      },
      { contains: "pg_advisory_xact_lock" },
      { contains: "insert into support_identity_accounts.support_accounts" },
      { contains: "set state = 'committed'" },
    ]);
    const adapter = new PostgresAccountAdapter(database);

    await expect(
      adapter.apply({
        action: "commit",
        transactionId: "transaction-1",
      }),
    ).resolves.toEqual({
      status: "committed",
      account: { ...pendingAccount, lifecycleState: "active" },
    });
    database.expectComplete();
  });

  it("prepares and reverses an active personal username change", async () => {
    const activeAccountRow = {
      account_id: "account-1",
      username: "OctoCat",
      display_name: "The Octocat",
      account_type: "personal",
      usage: "human",
      lifecycle_state: "active",
    } as const;
    const prepareDatabase = new ScriptedDatabase([
      { contains: "pg_advisory_xact_lock" },
      {
        contains: "where account_id = $1 and lifecycle_state = 'active'",
        result: queryResult(activeAccountRow),
      },
      {
        contains: "from support_identity_accounts.support_accounts",
        result: queryResult({ count: "0" }),
        values: ["account-1", "newname", true],
      },
      {
        contains: "insert into support_identity_accounts.support_account_identity_transactions",
      },
    ]);
    const prepareAdapter = new PostgresAccountAdapter(prepareDatabase);
    await expect(
      prepareAdapter.apply({
        action: "prepare-username-change",
        transactionId: "transaction-3",
        actorAccountId: "account-1",
        accountId: "account-1",
        newUsername: "NewName",
      }),
    ).resolves.toEqual({
      status: "prepared",
      account: {
        accountId: "account-1",
        username: "NewName",
        displayName: "The Octocat",
        accountType: "personal",
        usage: "human",
        lifecycleState: "active",
      },
    });
    prepareDatabase.expectComplete();

    const transaction = {
      account_id: "account-1",
      kind: "username-change",
      state: "committed",
      pending_username: "NewName",
      pending_normalized_username: "newname",
      pending_display_name: "The Octocat",
      pending_account_type: "personal",
      pending_usage: "human",
      pending_lifecycle_state: "active",
      previous_username: "OctoCat",
      previous_normalized_username: "octocat",
      previous_display_name: "The Octocat",
      previous_account_type: "personal",
      previous_usage: "human",
      previous_lifecycle_state: "active",
    } as const;
    const rollbackDatabase = new ScriptedDatabase([
      {
        contains: "from support_identity_accounts.support_account_identity_transactions",
        result: queryResult(transaction),
      },
      { contains: "pg_advisory_xact_lock" },
      { contains: "pg_advisory_xact_lock" },
      { contains: "update support_identity_accounts.support_accounts" },
      {
        contains: "delete from support_identity_accounts.support_account_identity_transactions",
      },
    ]);
    const rollbackAdapter = new PostgresAccountAdapter(rollbackDatabase);
    await expect(
      rollbackAdapter.apply({
        action: "rollback",
        transactionId: "transaction-3",
      }),
    ).resolves.toEqual({
      status: "rolled-back",
      account: {
        accountId: "account-1",
        username: "NewName",
        displayName: "The Octocat",
        accountType: "personal",
        usage: "human",
        lifecycleState: "active",
      },
    });
    rollbackDatabase.expectComplete();
  });

  it("rolls back and finalizes identity transactions reversibly", async () => {
    const rollbackDatabase = new ScriptedDatabase([
      {
        contains: "from support_identity_accounts.support_account_identity_transactions",
        result: queryResult(registrationTransaction),
      },
      { contains: "pg_advisory_xact_lock" },
      {
        contains: "delete from support_identity_accounts.support_account_identity_transactions",
      },
    ]);
    const rollbackAdapter = new PostgresAccountAdapter(rollbackDatabase);
    await expect(
      rollbackAdapter.apply({
        action: "rollback",
        transactionId: "transaction-1",
      }),
    ).resolves.toEqual({
      status: "rolled-back",
      account: pendingAccount,
    });
    rollbackDatabase.expectComplete();

    const finalizeDatabase = new ScriptedDatabase([
      {
        contains: "from support_identity_accounts.support_account_identity_transactions",
        result: queryResult({
          ...registrationTransaction,
          state: "committed",
        }),
      },
      {
        contains: "delete from support_identity_accounts.support_account_identity_transactions",
      },
    ]);
    const finalizeAdapter = new PostgresAccountAdapter(finalizeDatabase);
    await expect(
      finalizeAdapter.apply({
        action: "finalize",
        transactionId: "transaction-1",
      }),
    ).resolves.toEqual({
      status: "finalized",
      account: pendingAccount,
    });
    finalizeDatabase.expectComplete();
  });

  it("queries case-insensitively and marks an account deleted", async () => {
    const activeAccount = {
      account_id: "account-1",
      username: "OctoCat",
      display_name: "The Octocat",
      account_type: "personal",
      usage: "human",
      lifecycle_state: "active",
    } as const;
    const database = new ScriptedDatabase([
      {
        contains: "where normalized_username = $1",
        result: queryResult(activeAccount),
        values: ["octocat"],
      },
      {
        contains: "set lifecycle_state = 'deleted'",
        values: ["account-1"],
      },
    ]);
    const adapter = new PostgresAccountAdapter(database);

    await expect(adapter.findByUsername("  OCTOCAT ")).resolves.toEqual({
      accountId: "account-1",
      username: "OctoCat",
      displayName: "The Octocat",
      accountType: "personal",
      usage: "human",
      lifecycleState: "active",
    });
    await adapter.markDeleted("account-1");
    database.expectComplete();
  });
});
