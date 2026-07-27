export type AccountQuerySnapshot = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
  usage: "human" | "machine";
  lifecycleState: "pending" | "active" | "suspended" | "deleted";
}>;

export interface AccountQueryRepositoryPort {
  findByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null>;
  findPersonalByUsername(
    username: string,
  ): Promise<AccountQuerySnapshot | null>;
  findById(accountId: string): Promise<AccountQuerySnapshot | null>;
}
