import { describe, expect, it, vi } from "vitest";

import { InMemoryAccountQueryAdapter } from "../adapters/outbound/persistence/in-memory-account-query.adapter";
import { DeletePersonalAccountHandler } from "../application/commands/delete-personal-account.handler";

const prerequisites = {
  checkAccountDeletionPrerequisites: () =>
    Promise.resolve("allowed" as const),
};
const authenticationAdmin = {
  deleteAuthenticationUser: () => Promise.resolve(true),
};

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
    const handler = new DeletePersonalAccountHandler(
      accounts,
      prerequisites,
      authenticationAdmin,
    );

    await expect(
      handler.deletePersonalAccount({
        actorAccountId: "account_test",
        accountId: "account_test",
        supabaseUserId: "supabase-user-1",
      }),
    ).resolves.toEqual({ status: "deleted" });
    await expect(accounts.findById("account_test")).resolves.toMatchObject({
      lifecycleState: "deleted",
    });
  });

  it("rejects deletion by another account", async () => {
    const handler = new DeletePersonalAccountHandler(
      new InMemoryAccountQueryAdapter([]),
      prerequisites,
      authenticationAdmin,
    );

    await expect(
      handler.deletePersonalAccount({
        actorAccountId: "account_other",
        accountId: "account_test",
        supabaseUserId: "supabase-user-1",
      }),
    ).resolves.toEqual({ status: "forbidden" });
  });

  it("requires ownership transfer before deleting Supabase Auth", async () => {
    const deleteAuthenticationUser = vi.fn(() => Promise.resolve(true));
    const handler = new DeletePersonalAccountHandler(
      new InMemoryAccountQueryAdapter([
        {
          accountId: "account_test",
          username: "test",
          displayName: "Test",
          accountType: "personal",
          usage: "human",
          lifecycleState: "active",
        },
      ]),
      {
        checkAccountDeletionPrerequisites: () =>
          Promise.resolve("owns-organization"),
      },
      { deleteAuthenticationUser },
    );

    await expect(
      handler.deletePersonalAccount({
        actorAccountId: "account_test",
        accountId: "account_test",
        supabaseUserId: "supabase-user-1",
      }),
    ).resolves.toEqual({
      ownership: "organization",
      status: "ownership-transfer-required",
    });
    expect(deleteAuthenticationUser).not.toHaveBeenCalled();
  });
});
