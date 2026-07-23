import { describe, expect, it } from "vitest";

import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../application/ports/outbound/account-query.repository.port";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";

class AccountQueryRepositoryFake implements AccountQueryRepositoryPort {
  private readonly account: AccountQuerySnapshot | null;

  constructor(account: AccountQuerySnapshot | null) {
    this.account = account;
  }

  findPersonalByUsername() {
    return Promise.resolve(this.account);
  }
}

describe("GetPersonalAccountByUsernameHandler", () => {
  it("returns an active personal account", async () => {
    const handler = new GetPersonalAccountByUsernameHandler(
      new AccountQueryRepositoryFake({
        accountId: "account_octocat",
        username: "octocat",
        accountKind: "personal",
        lifecycleState: "active",
      }),
    );

    await expect(
      handler.getPersonalAccountByUsername({ username: "octocat" }),
    ).resolves.toEqual({
      status: "found",
      account: {
        accountId: "account_octocat",
        username: "octocat",
        accountKind: "personal",
        lifecycleState: "active",
      },
    });
  });

  it("does not expose a deleted account", async () => {
    const handler = new GetPersonalAccountByUsernameHandler(
      new AccountQueryRepositoryFake({
        accountId: "account_deleted",
        username: "deleted-user",
        accountKind: "personal",
        lifecycleState: "deleted",
      }),
    );

    await expect(
      handler.getPersonalAccountByUsername({ username: "deleted-user" }),
    ).resolves.toEqual({ status: "not-found" });
  });
});
