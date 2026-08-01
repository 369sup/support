import { describe, expect, it, vi } from "vitest";

import {
  assertPostgresMigrationsApplied,
  PostgresDatabase,
  runPostgresMigrations,
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

  it("runs unapplied migrations once in stable order", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);
    await runPostgresMigrations(database, [
      { id: "002_second", sql: "select 2" },
      { id: "001_first", sql: "select 1" },
    ]);

    const texts = pool.client.calls.map((call) => call.text);
    expect(texts.indexOf("select 1")).toBeLessThan(
      texts.indexOf("select 2"),
    );
    expect(
      texts.filter((text) =>
        text.startsWith("insert into support_schema_migrations"),
      ),
    ).toHaveLength(2);
  });

  it("rejects duplicate migration identifiers before connecting", async () => {
    const pool = new FakePool();
    const database = new PostgresDatabase(pool);

    await expect(
      runPostgresMigrations(database, [
        { id: "001_duplicate", sql: "select 1" },
        { id: "001_duplicate", sql: "select 2" },
      ]),
    ).rejects.toThrow("Duplicate migration id");
    expect(pool.client.calls).toHaveLength(0);
  });
});

describe("assertPostgresMigrationsApplied", () => {
  it("fails closed when a required migration is absent", async () => {
    const database = {
      query: vi.fn(() =>
        Promise.resolve({ rowCount: 0, rows: [] }),
      ),
    };

    await expect(
      assertPostgresMigrationsApplied(database, [
        { id: "required-001", sql: "select 1" },
      ]),
    ).rejects.toThrow("Database schema is not at the required version.");
  });
});
