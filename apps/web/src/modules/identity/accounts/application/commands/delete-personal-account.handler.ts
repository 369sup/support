import type {
  DeletePersonalAccountCommand,
  DeletePersonalAccountResult,
  DeletePersonalAccountUseCase,
} from "../ports/inbound/delete-personal-account.use-case";
import type { AccountDeletionPrerequisiteGatewayPort } from "../ports/outbound/account-deletion-prerequisite.gateway.port";
import type { AccountLifecycleRepositoryPort } from "../ports/outbound/account-lifecycle.repository.port";
import type { AuthenticationAdminGatewayPort } from "../ports/outbound/authentication-admin.gateway.port";

export class DeletePersonalAccountHandler
  implements DeletePersonalAccountUseCase
{
  private readonly accounts: AccountLifecycleRepositoryPort;
  private readonly prerequisites: AccountDeletionPrerequisiteGatewayPort;
  private readonly authenticationAdmin: AuthenticationAdminGatewayPort;

  constructor(
    accounts: AccountLifecycleRepositoryPort,
    prerequisites: AccountDeletionPrerequisiteGatewayPort,
    authenticationAdmin: AuthenticationAdminGatewayPort,
  ) {
    this.accounts = accounts;
    this.prerequisites = prerequisites;
    this.authenticationAdmin = authenticationAdmin;
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

    const prerequisite =
      await this.prerequisites.checkAccountDeletionPrerequisites(
        account.accountId,
    );
    if (prerequisite !== "allowed") {
      let ownership: "enterprise" | "organization" | "repository";
      if (prerequisite === "owns-enterprise") {
        ownership = "enterprise";
      } else if (prerequisite === "owns-organization") {
        ownership = "organization";
      } else {
        ownership = "repository";
      }
      return {
        ownership,
        status: "ownership-transfer-required",
      };
    }
    if (
      !(await this.authenticationAdmin.deleteAuthenticationUser(
        command.supabaseUserId,
      ))
    ) {
      return { status: "authentication-service-unavailable" };
    }
    await this.accounts.markDeleted(account.accountId);
    return { status: "deleted" };
  }
}
