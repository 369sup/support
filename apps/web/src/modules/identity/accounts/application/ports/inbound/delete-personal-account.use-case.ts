export type DeletePersonalAccountCommand = Readonly<{
  actorAccountId: string;
  accountId: string;
  supabaseUserId: string;
}>;

export type DeletePersonalAccountResult =
  | Readonly<{ status: "deleted" }>
  | Readonly<{ status: "account-not-found" }>
  | Readonly<{ status: "authentication-service-unavailable" }>
  | Readonly<{ status: "forbidden" }>
  | Readonly<{
      status: "ownership-transfer-required";
      ownership: "enterprise" | "organization" | "repository";
    }>
  | Readonly<{ status: "unsupported-account-type" }>;

export interface DeletePersonalAccountUseCase {
  deletePersonalAccount(
    command: DeletePersonalAccountCommand,
  ): Promise<DeletePersonalAccountResult>;
}
