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
  isReleased = false;

  query<Row extends SqlRow>(
    text: string,
    values?: readonly SqlValue[],
  ): Promise<SqlQueryResult<Row>> {
    this.calls.push(values === undefined ? { text } : { text, values });
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
  readonly client = new FakeClient();
  isClosed = false;

  connect(): Promise<PostgresClientPort> {
    return Promise.resolve(this.client);
  }

  end(): Promise<void> {
    this.isClosed = true;
    return Promise.resolve();
  }

  query<Row extends SqlRow>(): Promise<SqlQueryResult<Row>> {
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

});
