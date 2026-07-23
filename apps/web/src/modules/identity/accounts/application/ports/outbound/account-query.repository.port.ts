export type AccountQuerySnapshot = Readonly<{
  accountId: string;
  username: string;
  accountKind: "personal";
  lifecycleState: "active" | "deleted";
}>;

export interface AccountQueryRepositoryPort {
  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null>;
}
