export type UserOwnerReference = Readonly<{
  accountId: string;
  username: string;
}>;

export type PersonalAccountLookupResult =
  | Readonly<{
      ok: true;
      account: UserOwnerReference;
    }>
  | Readonly<{
      ok: false;
      error: "account-not-found" | "invalid-username";
    }>;
