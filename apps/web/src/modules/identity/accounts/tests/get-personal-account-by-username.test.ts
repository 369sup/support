import { describe, expect, it } from "vitest";

import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../application/ports/outbound/account-query.repository.port";
import { GetPersonalAccountByUsernameHandler } from "../application/queries/get-personal-account-by-username.handler";

class AccountQueryRepositoryFake implements AccountQueryRepositoryPort {
  private readonly account: AccountQuerySnapshot | null;
  readonly requestedUsernames: string[] = [];

  constructor(account: AccountQuerySnapshot | null) {
    this.account = account;
  }

  findPersonalByUsername(username: string) {
    this.requestedUsernames.push(username);
    return Promise.resolve(this.account);
  }
}

describe("GetPersonalAccountByUsernameHandler", () => {
  it("returns an active personal account", async () => {
    const repository = new AccountQueryRepositoryFake({
      accountId: "account_octocat",
      username: "octocat",
      accountKind: "personal",
      lifecycleState: "active",
    });
    const handler = new GetPersonalAccountByUsernameHandler(repository);

    await expect(
      handler.getPersonalAccountByUsername({ username: " octocat " }),
    ).resolves.toEqual({
      status: "found",
      account: {
        accountId: "account_octocat",
        username: "octocat",
        accountKind: "personal",
        lifecycleState: "active",
      },
    });
    expect(repository.requestedUsernames).toEqual(["octocat"]);
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
    ).resolves.toEqual({ status: "account-not-found" });
  });

  it("rejects a blank username before querying the repository", async () => {
    const repository = new AccountQueryRepositoryFake(null);
    const handler = new GetPersonalAccountByUsernameHandler(repository);

    await expect(
      handler.getPersonalAccountByUsername({ username: "   " }),
    ).resolves.toEqual({ status: "invalid-username" });
    expect(repository.requestedUsernames).toEqual([]);
  });
});
