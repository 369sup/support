import { describe, expect, it } from "vitest";

import type {
  AccountIdentityGatewayPort,
  AccountIdentityStep,
  AccountIdentityStepResult,
} from "../application/ports/outbound/account-identity.gateway.port";
import type { AccountRegistrationIdGeneratorPort } from "../application/ports/outbound/account-registration-id-generator.port";
import type {
  PasswordCredentialGatewayPort,
  PasswordCredentialStep,
  PasswordCredentialStepResult,
} from "../application/ports/outbound/password-credential.gateway.port";
import { AccountRegistrationService } from "../application/services/account-registration.service";

class AccountGatewayFake implements AccountIdentityGatewayPort {
  readonly actions: string[] = [];
  private readonly prepareStatus: "prepared" | "username-conflict";
  private readonly commitStatus: "committed" | "transaction-not-found";

  constructor(
    prepareStatus: "prepared" | "username-conflict" = "prepared",
    commitStatus: "committed" | "transaction-not-found" = "committed",
  ) {
    this.prepareStatus = prepareStatus;
    this.commitStatus = commitStatus;
  }

  apply(step: AccountIdentityStep): Promise<AccountIdentityStepResult> {
    this.actions.push(step.action);
    if (step.action === "prepare-registration") {
      return Promise.resolve(
        this.prepareStatus === "prepared"
          ? { status: "prepared", account: step.account }
          : { status: this.prepareStatus },
      );
    }
    if (step.action === "prepare-username-change") {
      return Promise.resolve({
        status: "prepared",
        account: {
          accountId: step.accountId,
          username: step.newUsername,
          accountType: "personal",
          usage: "human",
          lifecycleState: "active",
        },
      });
    }
    if (step.action === "commit") {
      return Promise.resolve(
        this.commitStatus === "committed"
          ? {
              status: "committed",
              account: {
                accountId: "account_1",
                username: "new-user",
                accountType: "personal",
                usage: "human",
                lifecycleState: "active",
              },
            }
          : { status: this.commitStatus },
      );
    }
    return Promise.resolve({
      status: step.action === "finalize" ? "finalized" : "rolled-back",
      account: {
        accountId: "account_1",
        username: "new-user",
        accountType: "personal",
        usage: "human",
        lifecycleState: "active",
      },
    });
  }
}

class CredentialGatewayFake implements PasswordCredentialGatewayPort {
  readonly actions: string[] = [];
  private readonly prepareStatus: "credential-conflict" | "prepared";
  private readonly commitStatus: "committed" | "transaction-not-found";

  constructor(
    prepareStatus: "credential-conflict" | "prepared" = "prepared",
    commitStatus: "committed" | "transaction-not-found" = "committed",
  ) {
    this.prepareStatus = prepareStatus;
    this.commitStatus = commitStatus;
  }

  apply(
    step: PasswordCredentialStep,
  ): Promise<PasswordCredentialStepResult> {
    this.actions.push(step.action);
    if (
      step.action === "prepare-registration" ||
      step.action === "prepare-username-change"
    ) {
      return Promise.resolve(
        this.prepareStatus === "prepared"
          ? {
              status: "prepared",
              accountId: step.accountId,
              username:
                step.action === "prepare-registration"
                  ? step.username
                  : step.newUsername,
            }
          : { status: this.prepareStatus },
      );
    }
    if (step.action === "commit") {
      return Promise.resolve(
        this.commitStatus === "committed"
          ? {
              status: "committed",
              accountId: "account_1",
              username: "new-user",
            }
          : { status: this.commitStatus },
      );
    }
    return Promise.resolve({
      status: step.action === "finalize" ? "finalized" : "rolled-back",
      accountId: "account_1",
      username: "new-user",
    });
  }
}

class ThrowingCredentialGatewayFake
  implements PasswordCredentialGatewayPort
{
  readonly actions: string[] = [];

  apply(
    step: PasswordCredentialStep,
  ): Promise<PasswordCredentialStepResult> {
    this.actions.push(step.action);
    if (step.action === "commit") {
      return Promise.reject(new Error("simulated credential commit failure"));
    }
    return Promise.resolve({
      status: step.action === "prepare-registration" ? "prepared" : "rolled-back",
      accountId:
        step.action === "prepare-registration" ? step.accountId : "account_1",
      username:
        step.action === "prepare-registration" ? step.username : "new-user",
    });
  }
}

class IdGeneratorFake implements AccountRegistrationIdGeneratorPort {
  nextAccountId() {
    return "account_1";
  }

  nextTransactionId() {
    return "transaction_1";
  }
}

describe("AccountRegistrationService", () => {
  it("creates account and credential through one compensatable transaction", async () => {
    const accounts = new AccountGatewayFake();
    const credentials = new CredentialGatewayFake();
    const service = new AccountRegistrationService(
      accounts,
      credentials,
      new IdGeneratorFake(),
    );

    await expect(
      service.register({
        username: "new-user",
        password: "secure-password-value",
      }),
    ).resolves.toEqual({
      status: "created",
      account: { accountId: "account_1", username: "new-user" },
    });
    expect(accounts.actions).toEqual([
      "prepare-registration",
      "commit",
      "finalize",
    ]);
    expect(credentials.actions).toEqual([
      "prepare-registration",
      "commit",
      "finalize",
    ]);
  });

  it("rolls back both participants when the second commit fails", async () => {
    const accounts = new AccountGatewayFake();
    const credentials = new CredentialGatewayFake(
      "prepared",
      "transaction-not-found",
    );
    const service = new AccountRegistrationService(
      accounts,
      credentials,
      new IdGeneratorFake(),
    );

    await expect(
      service.register({
        username: "new-user",
        password: "secure-password-value",
      }),
    ).resolves.toEqual({ status: "registration-failed" });
    expect(accounts.actions).toContain("rollback");
    expect(credentials.actions).toContain("rollback");
  });

  it("compensates both participants when a commit throws", async () => {
    const accounts = new AccountGatewayFake();
    const credentials = new ThrowingCredentialGatewayFake();
    const service = new AccountRegistrationService(
      accounts,
      credentials,
      new IdGeneratorFake(),
    );

    await expect(
      service.register({
        username: "new-user",
        password: "secure-password-value",
      }),
    ).resolves.toEqual({ status: "registration-failed" });
    expect(accounts.actions).toContain("rollback");
    expect(credentials.actions).toContain("rollback");
  });

  it("changes a personal username while coordinating the credential lock", async () => {
    const accounts = new AccountGatewayFake();
    const credentials = new CredentialGatewayFake();
    const service = new AccountRegistrationService(
      accounts,
      credentials,
      new IdGeneratorFake(),
    );

    await expect(
      service.changeUsername({
        actorAccountId: "account_1",
        accountId: "account_1",
        newUsername: "renamed-user",
      }),
    ).resolves.toEqual({
      status: "changed",
      account: { accountId: "account_1", username: "renamed-user" },
    });
    expect(accounts.actions).toEqual([
      "prepare-username-change",
      "commit",
      "finalize",
    ]);
    expect(credentials.actions).toEqual([
      "prepare-username-change",
      "commit",
      "finalize",
    ]);
  });

  it("enforces username and GitHub password minimums before preparing", async () => {
    const accounts = new AccountGatewayFake();
    const credentials = new CredentialGatewayFake();
    const service = new AccountRegistrationService(
      accounts,
      credentials,
      new IdGeneratorFake(),
    );

    await expect(
      service.register({ username: "-invalid", password: "long-password-1" }),
    ).resolves.toEqual({ status: "invalid-username" });
    await expect(
      service.register({ username: "valid-user", password: "abcdefgh" }),
    ).resolves.toEqual({ status: "weak-password" });
    await expect(
      service.register({ username: "valid--user", password: "abcdefgh1" }),
    ).resolves.toEqual({ status: "invalid-username" });
    expect(accounts.actions).toEqual([]);
    expect(credentials.actions).toEqual([]);
  });
});
