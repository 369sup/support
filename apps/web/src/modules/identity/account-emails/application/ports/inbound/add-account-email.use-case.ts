import type { AccountEmail } from "../../../domain/account-email";

export type AddAccountEmailCommand = Readonly<{
  accountId: string;
  address: string;
  isManagedAccount: boolean;
  ownership: "personal" | "scim";
}>;

export type AddAccountEmailResult =
  | Readonly<{ status: "added"; email: AccountEmail }>
  | Readonly<{
      status:
        | "account-email-limit"
        | "email-already-owned"
        | "email-quarantined"
        | "invalid-email"
        | "managed-by-identity-provider";
    }>;

export interface AddAccountEmailUseCase {
  addAccountEmail(
    command: AddAccountEmailCommand,
  ): Promise<AddAccountEmailResult>;
}
