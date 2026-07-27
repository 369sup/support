import type {
  ChangePersonalAccountUsernameCommand,
  ChangePersonalAccountUsernameResult,
} from "../ports/inbound/change-personal-account-username.use-case";
import type {
  RegisterPersonalAccountCommand,
  RegisterPersonalAccountResult,
} from "../ports/inbound/register-personal-account.use-case";
import type { AccountIdentityGatewayPort } from "../ports/outbound/account-identity.gateway.port";
import type { AccountRegistrationIdGeneratorPort } from "../ports/outbound/account-registration-id-generator.port";
import type { PasswordCredentialGatewayPort } from "../ports/outbound/password-credential.gateway.port";

const usernamePattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export class AccountRegistrationService {
  private readonly accountGateway: AccountIdentityGatewayPort;
  private readonly credentialGateway: PasswordCredentialGatewayPort;
  private readonly idGenerator: AccountRegistrationIdGeneratorPort;

  constructor(
    accountGateway: AccountIdentityGatewayPort,
    credentialGateway: PasswordCredentialGatewayPort,
    idGenerator: AccountRegistrationIdGeneratorPort,
  ) {
    this.accountGateway = accountGateway;
    this.credentialGateway = credentialGateway;
    this.idGenerator = idGenerator;
  }

  async register(
    command: RegisterPersonalAccountCommand,
  ): Promise<RegisterPersonalAccountResult> {
    const username = command.username.trim();
    if (!this.isValidUsername(username)) {
      return { status: "invalid-username" };
    }
    if (!this.isStrongPassword(command.password)) {
      return { status: "weak-password" };
    }
    const transactionId = this.idGenerator.nextTransactionId();
    const accountId = this.idGenerator.nextAccountId();
    try {
      const accountPrepared = await this.accountGateway.apply({
        action: "prepare-registration",
        transactionId,
        account: {
          accountId,
          username,
          displayName: username,
          accountType: "personal",
          usage: "human",
          lifecycleState: "pending",
        },
      });
      if (accountPrepared.status === "username-conflict") {
        return { status: "username-conflict" };
      }
      if (accountPrepared.status !== "prepared") {
        return { status: "registration-failed" };
      }

      const credentialPrepared = await this.credentialGateway.apply({
        action: "prepare-registration",
        transactionId,
        accountId,
        username,
        password: command.password,
      });
      if (credentialPrepared.status !== "prepared") {
        await this.rollbackBoth(transactionId);
        return {
          status:
            credentialPrepared.status === "credential-conflict"
              ? "username-conflict"
              : "registration-failed",
        };
      }

      const [accountCommitted, credentialCommitted] = await Promise.all([
        this.accountGateway.apply({ action: "commit", transactionId }),
        this.credentialGateway.apply({ action: "commit", transactionId }),
      ]);
      if (
        accountCommitted.status !== "committed" ||
        credentialCommitted.status !== "committed"
      ) {
        await this.rollbackBoth(transactionId);
        return { status: "registration-failed" };
      }
      await this.finalizeBoth(transactionId);
      return {
        status: "created",
        account: { accountId, username },
      };
    } catch {
      await this.rollbackBoth(transactionId);
      return { status: "registration-failed" };
    }
  }

  async changeUsername(
    command: ChangePersonalAccountUsernameCommand,
  ): Promise<ChangePersonalAccountUsernameResult> {
    const newUsername = command.newUsername.trim();
    if (!this.isValidUsername(newUsername)) {
      return { status: "invalid-username" };
    }
    const transactionId = this.idGenerator.nextTransactionId();
    try {
      const accountPrepared = await this.accountGateway.apply({
        action: "prepare-username-change",
        transactionId,
        actorAccountId: command.actorAccountId,
        accountId: command.accountId,
        newUsername,
      });
      if (accountPrepared.status !== "prepared") {
        return {
          status:
            accountPrepared.status === "account-not-found" ||
            accountPrepared.status === "permission-denied" ||
            accountPrepared.status === "unsupported-account-type" ||
            accountPrepared.status === "username-conflict"
              ? accountPrepared.status
              : "transaction-failed",
        };
      }
      const credentialPrepared = await this.credentialGateway.apply({
        action: "prepare-username-change",
        transactionId,
        accountId: command.accountId,
        newUsername,
      });
      if (credentialPrepared.status !== "prepared") {
        await this.rollbackBoth(transactionId);
        if (credentialPrepared.status === "credential-not-found") {
          return { status: "credential-unavailable" };
        }
        if (credentialPrepared.status === "credential-conflict") {
          return { status: "username-conflict" };
        }
        return { status: "transaction-failed" };
      }

      const [accountCommitted, credentialCommitted] = await Promise.all([
        this.accountGateway.apply({ action: "commit", transactionId }),
        this.credentialGateway.apply({ action: "commit", transactionId }),
      ]);
      if (
        accountCommitted.status !== "committed" ||
        credentialCommitted.status !== "committed"
      ) {
        await this.rollbackBoth(transactionId);
        return { status: "transaction-failed" };
      }
      await this.finalizeBoth(transactionId);
      return {
        status: "changed",
        account: {
          accountId: command.accountId,
          username: newUsername,
        },
      };
    } catch {
      await this.rollbackBoth(transactionId);
      return { status: "transaction-failed" };
    }
  }

  private finalizeBoth(transactionId: string): Promise<unknown> {
    return Promise.allSettled([
      this.accountGateway.apply({ action: "finalize", transactionId }),
      this.credentialGateway.apply({ action: "finalize", transactionId }),
    ]);
  }

  private rollbackBoth(transactionId: string): Promise<unknown> {
    return Promise.allSettled([
      this.accountGateway.apply({ action: "rollback", transactionId }),
      this.credentialGateway.apply({ action: "rollback", transactionId }),
    ]);
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length <= 128 &&
      (password.length >= 15 ||
        (password.length >= 8 && /[a-z]/.test(password) && /\d/.test(password)))
    );
  }

  private isValidUsername(username: string): boolean {
    return usernamePattern.test(username) && !username.includes("--");
  }
}
