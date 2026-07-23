import type {
  AccountQueryRepositoryPort,
} from "../ports/outbound/account-query.repository.port";
import type {
  GetPersonalAccountByUsernameQuery,
  GetPersonalAccountByUsernameResult,
  GetPersonalAccountByUsernameUseCase,
} from "../ports/inbound/get-personal-account-by-username.use-case";

export class GetPersonalAccountByUsernameHandler
  implements GetPersonalAccountByUsernameUseCase
{
  private readonly accountQueryRepository: AccountQueryRepositoryPort;

  constructor(accountQueryRepository: AccountQueryRepositoryPort) {
    this.accountQueryRepository = accountQueryRepository;
  }

  async getPersonalAccountByUsername(
    query: GetPersonalAccountByUsernameQuery,
  ): Promise<GetPersonalAccountByUsernameResult> {
    const account =
      await this.accountQueryRepository.findPersonalByUsername(query.username);

    if (account === null || account.lifecycleState !== "active") {
      return { status: "not-found" };
    }

    return { status: "found", account };
  }
}
