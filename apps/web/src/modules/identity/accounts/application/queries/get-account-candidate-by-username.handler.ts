import type {
  GetAccountCandidateByUsernameQuery,
  GetAccountCandidateByUsernameResult,
  GetAccountCandidateByUsernameUseCase,
} from "../ports/inbound/get-account-candidate-by-username.use-case";
import type { AccountQueryRepositoryPort } from "../ports/outbound/account-query.repository.port";

export class GetAccountCandidateByUsernameHandler
  implements GetAccountCandidateByUsernameUseCase
{
  private readonly accountQueryRepository: AccountQueryRepositoryPort;

  constructor(accountQueryRepository: AccountQueryRepositoryPort) {
    this.accountQueryRepository = accountQueryRepository;
  }

  async getAccountCandidateByUsername(
    query: GetAccountCandidateByUsernameQuery,
  ): Promise<GetAccountCandidateByUsernameResult> {
    const normalizedUsername = query.username.trim();
    if (normalizedUsername.length === 0) {
      return { status: "invalid-username" };
    }

    const account =
      await this.accountQueryRepository.findByUsername(normalizedUsername);
    if (account === null || account.lifecycleState !== "active") {
      return { status: "account-not-found" };
    }

    return { status: "found", account };
  }
}
