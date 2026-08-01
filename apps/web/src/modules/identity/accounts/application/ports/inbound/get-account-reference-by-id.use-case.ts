import type { AccountQuerySnapshot } from "../outbound/account-query.repository.port";

export type GetAccountReferenceByIdQuery = Readonly<{ accountId: string }>;

export type GetAccountReferenceByIdResult =
  | Readonly<{ status: "found"; account: AccountQuerySnapshot }>
  | Readonly<{ status: "account-not-found" }>;

export interface GetAccountReferenceByIdUseCase {
  getAccountReferenceById(
    query: GetAccountReferenceByIdQuery,
  ): Promise<GetAccountReferenceByIdResult>;
}
