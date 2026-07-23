import type { AccountQuerySnapshot } from "../outbound/account-query.repository.port";

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

export interface GetPersonalAccountByUsernameUseCase {
  getPersonalAccountByUsername(
    query: GetPersonalAccountByUsernameQuery,
  ): Promise<GetPersonalAccountByUsernameResult>;
}
