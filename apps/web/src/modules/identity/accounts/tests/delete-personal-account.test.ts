import { describe, expect, it } from "vitest";

import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import { DeletePersonalAccountHandler } from "../application/commands/delete-personal-account.handler";

describe("delete personal account", () => {
  it("marks the owned human personal account as deleted", async () => {
    const accounts = new InMemoryAccountQueryAdapter([
      {
        accountId: "account_test",
        username: "test",
        displayName: "Test",
        accountType: "personal",
        usage: "human",
        lifecycleState: "active",
      },
    ]);
    const handler = new DeletePersonalAccountHandler(accounts);

    await expect(
      handler.deletePersonalAccount({
        actorAccountId: "account_test",
        accountId: "account_test",
      }),
    ).resolves.toEqual({ status: "deleted" });
    await expect(accounts.findById("account_test")).resolves.toMatchObject({
      lifecycleState: "deleted",
    });
  });

  it("rejects deletion by another account", async () => {
    const handler = new DeletePersonalAccountHandler(
      new InMemoryAccountQueryAdapter([]),
    );

    await expect(
      handler.deletePersonalAccount({
        actorAccountId: "account_other",
        accountId: "account_test",
      }),
    ).resolves.toEqual({ status: "forbidden" });
  });
});
