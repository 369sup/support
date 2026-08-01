export type GetVerifiedAccountIdByEmailQuery = Readonly<{
  email: string;
}>;

export type GetVerifiedAccountIdByEmailResult =
  | Readonly<{ accountId: string; status: "found" }>
  | Readonly<{ status: "email-not-found" }>;

export interface GetVerifiedAccountIdByEmailUseCase {
  getVerifiedAccountIdByEmail(
    query: GetVerifiedAccountIdByEmailQuery,
  ): Promise<GetVerifiedAccountIdByEmailResult>;
}
