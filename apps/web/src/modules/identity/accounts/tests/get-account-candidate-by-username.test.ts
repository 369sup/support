import { describe, expect, it } from "vitest";

import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../application/ports/outbound/account-query.repository.port";
import { GetAccountCandidateByUsernameHandler } from "../application/queries/get-account-candidate-by-username.handler";

class AccountQueryRepositoryFake implements AccountQueryRepositoryPort {
  private readonly account: AccountQuerySnapshot | null;
  readonly requestedUsernames: string[] = [];

  constructor(account: AccountQuerySnapshot | null) {
    this.account = account;
  }

  findByUsername(username: string) {
    this.requestedUsernames.push(username);
    return Promise.resolve(this.account);
  }

  findPersonalByUsername(username: string) {
    return this.findByUsername(username);
  }

  findById() {
    return Promise.resolve(this.account);
  }
}

describe("GetAccountCandidateByUsernameHandler", () => {
  it("returns an active managed account to a trusted server consumer", async () => {
    const repository = new AccountQueryRepositoryFake({
      accountId: "account_carol_acme",
      username: "carol_ACME",
      displayName: "Carol",
      accountType: "managed",
      usage: "human",
      lifecycleState: "active",
    });
    const handler = new GetAccountCandidateByUsernameHandler(repository);

    await expect(
      handler.getAccountCandidateByUsername({ username: " carol_ACME " }),
    ).resolves.toEqual({
      status: "found",
      account: {
        accountId: "account_carol_acme",
        username: "carol_ACME",
        displayName: "Carol",
        accountType: "managed",
        usage: "human",
        lifecycleState: "active",
      },
    });
    expect(repository.requestedUsernames).toEqual(["carol_ACME"]);
  });

  it("does not return an inactive account", async () => {
    const handler = new GetAccountCandidateByUsernameHandler(
      new AccountQueryRepositoryFake({
        accountId: "account_suspended",
        username: "suspended",
        displayName: "Suspended",
        accountType: "managed",
        usage: "human",
        lifecycleState: "suspended",
      }),
    );

    await expect(
      handler.getAccountCandidateByUsername({ username: "suspended" }),
    ).resolves.toEqual({ status: "account-not-found" });
  });

  it("rejects a blank username without a repository lookup", async () => {
    const repository = new AccountQueryRepositoryFake(null);
    const handler = new GetAccountCandidateByUsernameHandler(repository);

    await expect(
      handler.getAccountCandidateByUsername({ username: "   " }),
    ).resolves.toEqual({ status: "invalid-username" });
    expect(repository.requestedUsernames).toEqual([]);
  });
});
