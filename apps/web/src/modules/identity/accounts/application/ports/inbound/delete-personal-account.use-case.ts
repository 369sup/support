export type DeletePersonalAccountCommand = Readonly<{
  actorAccountId: string;
  accountId: string;
}>;

export type DeletePersonalAccountResult =
  | Readonly<{ status: "deleted" }>
  | Readonly<{ status: "account-not-found" }>
  | Readonly<{ status: "forbidden" }>
  | Readonly<{ status: "unsupported-account-type" }>;

export interface DeletePersonalAccountUseCase {
  deletePersonalAccount(
    command: DeletePersonalAccountCommand,
  ): Promise<DeletePersonalAccountResult>;
}
