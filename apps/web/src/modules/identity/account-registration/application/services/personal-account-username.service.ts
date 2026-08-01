import type {
  ChangePersonalAccountUsernameCommand,
  ChangePersonalAccountUsernameResult,
} from "../ports/inbound/change-personal-account-username.use-case";
import type { AccountIdentityGatewayPort } from "../ports/outbound/account-identity.gateway.port";
import type { AccountRegistrationIdGeneratorPort } from "../ports/outbound/account-registration-id-generator.port";

const usernamePattern =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/u;

export class PersonalAccountUsernameService {
  private readonly accounts: AccountIdentityGatewayPort;
  private readonly ids: AccountRegistrationIdGeneratorPort;

  constructor(
    accounts: AccountIdentityGatewayPort,
    ids: AccountRegistrationIdGeneratorPort,
  ) {
    this.accounts = accounts;
    this.ids = ids;
  }

  async changeUsername(
    command: ChangePersonalAccountUsernameCommand,
  ): Promise<ChangePersonalAccountUsernameResult> {
    const newUsername = command.newUsername.trim();
    if (!usernamePattern.test(newUsername) || newUsername.includes("--")) {
      return { status: "invalid-username" };
    }
    const transactionId = this.ids.nextTransactionId();
    try {
      const prepared = await this.accounts.apply({
        action: "prepare-username-change",
        transactionId,
        actorAccountId: command.actorAccountId,
        accountId: command.accountId,
        newUsername,
      });
      if (prepared.status !== "prepared") {
        return {
          status:
            prepared.status === "account-not-found" ||
            prepared.status === "permission-denied" ||
            prepared.status === "unsupported-account-type" ||
            prepared.status === "username-conflict"
              ? prepared.status
              : "transaction-failed",
        };
      }
      const committed = await this.accounts.apply({
        action: "commit",
        transactionId,
      });
      if (committed.status !== "committed") {
        await this.rollback(transactionId);
        return { status: "transaction-failed" };
      }
      await this.accounts.apply({ action: "finalize", transactionId });
      return {
        status: "changed",
        account: {
          accountId: command.accountId,
          username: newUsername,
        },
      };
    } catch {
      await this.rollback(transactionId);
      return { status: "transaction-failed" };
    }
  }

  private async rollback(transactionId: string): Promise<void> {
    try {
      await this.accounts.apply({ action: "rollback", transactionId });
    } catch {
      // The original transaction failure remains authoritative.
    }
  }
}
