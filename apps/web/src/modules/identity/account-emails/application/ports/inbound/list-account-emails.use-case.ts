import type { AccountEmail } from "../../../domain/account-email";

export type ListAccountEmailsQuery = Readonly<{ accountId: string }>;

export type ListAccountEmailsResult =
  | Readonly<{ status: "found"; emails: readonly AccountEmail[] }>
  | Readonly<{ status: "invalid-account" }>;

export interface ListAccountEmailsUseCase {
  listAccountEmails(
    query: ListAccountEmailsQuery,
  ): Promise<ListAccountEmailsResult>;
}
