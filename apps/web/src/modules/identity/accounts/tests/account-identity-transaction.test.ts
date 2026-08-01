import { describe, expect, it } from "vitest";

import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";

describe("account identity transaction", () => {
  it("reserves registration invisibly and can compensate after commit", async () => {
    const adapter = new InMemoryAccountQueryAdapter([]);
    const account = {
      accountId: "account_new",
      username: "new-user",
      displayName: "new-user",
      accountType: "personal" as const,
      usage: "human" as const,
      lifecycleState: "pending" as const,
    };

    await expect(
      adapter.apply({
        action: "prepare-registration",
        transactionId: "transaction_1",
        account,
      }),
    ).resolves.toEqual({ status: "prepared", account });
    await expect(adapter.findByUsername("new-user")).resolves.toBeNull();
    await expect(
      adapter.apply({
        action: "prepare-registration",
        transactionId: "transaction_2",
        account: { ...account, accountId: "account_other" },
      }),
    ).resolves.toEqual({ status: "username-conflict" });

    await expect(
      adapter.apply({ action: "commit", transactionId: "transaction_1" }),
    ).resolves.toMatchObject({
      status: "committed",
      account: { lifecycleState: "active" },
    });
    await expect(adapter.findByUsername("new-user")).resolves.toMatchObject({
      accountId: "account_new",
    });
    await adapter.apply({
      action: "rollback",
      transactionId: "transaction_1",
    });
    await expect(adapter.findByUsername("new-user")).resolves.toBeNull();
  });

  it("reserves and rolls back a username change without losing the old name", async () => {
    const original = {
      accountId: "account_owner",
      username: "owner",
      displayName: "Owner",
      accountType: "personal" as const,
      usage: "human" as const,
      lifecycleState: "active" as const,
    };
    const adapter = new InMemoryAccountQueryAdapter([original]);

    await adapter.apply({
      action: "prepare-username-change",
      transactionId: "transaction_1",
      actorAccountId: original.accountId,
      accountId: original.accountId,
      newUsername: "renamed-owner",
    });
    await expect(adapter.findByUsername("owner")).resolves.toEqual(original);
    await expect(adapter.findByUsername("renamed-owner")).resolves.toBeNull();
    await adapter.apply({ action: "commit", transactionId: "transaction_1" });
    await expect(adapter.findByUsername("owner")).resolves.toBeNull();
    await expect(
      adapter.findByUsername("renamed-owner"),
    ).resolves.toMatchObject({ accountId: original.accountId });

    await adapter.apply({ action: "rollback", transactionId: "transaction_1" });
    await expect(adapter.findByUsername("owner")).resolves.toEqual(original);
    await expect(adapter.findByUsername("renamed-owner")).resolves.toBeNull();
  });
});
