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
      status: "account-not-found";
    }>
  | Readonly<{
      status: "invalid-username";
    }>;

export interface GetPersonalAccountByUsernameUseCase {
  getPersonalAccountByUsername(
    query: GetPersonalAccountByUsernameQuery,
  ): Promise<GetPersonalAccountByUsernameResult>;
}
