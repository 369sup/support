export type AccountReference = Readonly<{
  accountId: string;
  username: string;
  displayName: string;
  accountType: "personal" | "managed";
  usage: "human" | "machine";
  lifecycleState: "active" | "suspended" | "deleted";
}>;

export type ActorReference = Pick<
  AccountReference,
  "accountId" | "username" | "accountType" | "usage"
>;

export type AccountReferenceLookupResult =
  | Readonly<{ status: "found"; account: AccountReference }>
  | Readonly<{ status: "account-not-found" }>;
