import type {
  AccountQueryRepositoryPort,
  AccountQuerySnapshot,
} from "../ports/outbound/account-query.repository.port";

export type GetPersonalAccountByUsernameQuery = Readonly<{
  username: string;
}>;

export type GetPersonalAccountByUsernameResult =
  | Readonly<{
      status: "found";
      account: AccountQuerySnapshot;
    }>
  | Readonly<{
      status: "not-found";
    }>;

export class GetPersonalAccountByUsernameHandler {
  private readonly accountQueryRepository: AccountQueryRepositoryPort;

  constructor(accountQueryRepository: AccountQueryRepositoryPort) {
    this.accountQueryRepository = accountQueryRepository;
  }

  async execute(
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
