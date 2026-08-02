import { describe, expect, it } from "vitest";

import {
  PostgresDatabase,
  type PostgresClientPort,
  type PostgresPoolPort,
  type SqlQueryResult,
  type SqlRow,
  type SqlValue,
} from "../src/postgres";

class FakeClient implements PostgresClientPort {
  readonly calls: { text: string; values?: readonly SqlValue[] }[] = [];
  failOnText: string | undefined;
  isReleased = false;

  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    this.calls.push(values === undefined ? { text } : { text, values });
    if (text === this.failOnText) {
      return Promise.reject(new Error(`Query failed: ${text}`));
    }
    return Promise.resolve({
      rowCount: 0,
      rows: [],
    });
  }

  release(): void {
    this.isReleased = true;
  }
}

class FakePool implements PostgresPoolPort {
  readonly calls: { text: string; values?: readonly SqlValue[] }[] = [];
  readonly client = new FakeClient();
  connectCount = 0;
  isClosed = false;

  connect(): Promise<PostgresClientPort> {
    this.connectCount += 1;
    return Promise.resolve(this.client);
  }

  end(): Promise<void> {
    this.isClosed = true;
    return Promise.resolve();
  }

  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    this.calls.push(values === undefined ? { text } : { text, values });
    return Promise.resolve({ rowCount: 0, rows: [] });
  }
}

describe("PostgresDatabase", () => {
  it("commits work on one checked-out connection", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);

    const result = await database.transaction(async (connection) => {
      await connection.query("select 1");
      return "done";
    });

    expect(result).toBe("done");
    expect(pool.client.calls.map((call) => call.text)).toEqual([
      "begin",
      "select 1",
      "commit",
    ]);
    expect(pool.client.isReleased).toBe(true);
  });

  it("rolls back and releases the client when work fails", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);

    await expect(
      database.transaction(() => Promise.reject(new Error("failed"))),
    ).rejects.toThrow("failed");

    expect(pool.client.calls.map((call) => call.text)).toEqual([
      "begin",
      "rollback",
    ]);
    expect(pool.client.isReleased).toBe(true);
  });

  it("routes database queries through the active transaction connection", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);

    await database.transaction(async () => {
      await database.query("insert domain record");
      await database.query("insert outbox record");
    });

    expect(pool.calls).toEqual([]);
    expect(pool.client.calls.map((call) => call.text)).toEqual([
      "begin",
      "insert domain record",
      "insert outbox record",
      "commit",
    ]);
  });

  it("rolls back earlier writes when a later routed query fails", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);
    pool.client.failOnText = "insert outbox record";

    await expect(
      database.transaction(async () => {
        await database.query("insert domain record");
        await database.query("insert outbox record");
      }),
    ).rejects.toThrow("Query failed: insert outbox record");

    expect(pool.client.calls.map((call) => call.text)).toEqual([
      "begin",
      "insert domain record",
      "insert outbox record",
      "rollback",
    ]);
    expect(pool.client.isReleased).toBe(true);
  });

  it("reuses the active connection for nested transaction boundaries", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);

    await database.transaction(() =>
      database.transaction(() => database.query("nested work")),
    );

    expect(pool.connectCount).toBe(1);
    expect(pool.client.calls.map((call) => call.text)).toEqual([
      "begin",
      "nested work",
      "commit",
    ]);
  });
});
