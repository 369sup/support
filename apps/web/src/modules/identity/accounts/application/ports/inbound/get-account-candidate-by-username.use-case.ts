import type { AccountQuerySnapshot } from "../outbound/account-query.repository.port";

export type GetAccountCandidateByUsernameQuery = Readonly<{
  username: string;
}>;

export type GetAccountCandidateByUsernameResult =
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

export interface GetAccountCandidateByUsernameUseCase {
  getAccountCandidateByUsername(
    query: GetAccountCandidateByUsernameQuery,
  ): Promise<GetAccountCandidateByUsernameResult>;
}
