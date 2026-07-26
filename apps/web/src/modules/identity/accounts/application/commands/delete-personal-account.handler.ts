import type {
  DeletePersonalAccountCommand,
  DeletePersonalAccountResult,
  DeletePersonalAccountUseCase,
} from "../ports/inbound/delete-personal-account.use-case";
import type { AccountLifecycleRepositoryPort } from "../ports/outbound/account-lifecycle.repository.port";

export class DeletePersonalAccountHandler
  implements DeletePersonalAccountUseCase
{
  private readonly accounts: AccountLifecycleRepositoryPort;

  constructor(accounts: AccountLifecycleRepositoryPort) {
    this.accounts = accounts;
  }

  async deletePersonalAccount(
    command: DeletePersonalAccountCommand,
  ): Promise<DeletePersonalAccountResult> {
    if (command.actorAccountId !== command.accountId) {
      return { status: "forbidden" };
    }

    const account = await this.accounts.findById(command.accountId);
    if (account === null || account.lifecycleState !== "active") {
      return { status: "account-not-found" };
    }

    if (account.accountType !== "personal" || account.usage !== "human") {
      return { status: "unsupported-account-type" };
    }

    await this.accounts.markDeleted(account.accountId);
    return { status: "deleted" };
  }
}
