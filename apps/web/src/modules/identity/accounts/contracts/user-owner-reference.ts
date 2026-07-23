export type UserOwnerReference = Readonly<{
  accountId: string;
  username: string;
}>;

export type PersonalAccountLookupResult =
  | Readonly<{
      isSuccessful: true;
      account: UserOwnerReference;
    }>
  | Readonly<{
      isSuccessful: false;
      error: "account-not-found" | "invalid-username";
    }>;
