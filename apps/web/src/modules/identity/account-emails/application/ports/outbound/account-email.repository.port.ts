import type {
  AccountEmail,
  EmailVerification,
  OrganizationNotificationRoute,
} from "../../../domain/account-email";

export interface AccountEmailRepositoryPort {
  add(email: AccountEmail): Promise<
    | Readonly<{ status: "added" }>
    | Readonly<{
        status:
          | "account-email-limit"
          | "email-already-owned"
          | "email-quarantined";
      }>
  >;
  findByAddress(address: string): Promise<AccountEmail | null>;
  findById(emailId: string): Promise<AccountEmail | null>;
  findVerificationByTokenHash(
    tokenHash: string,
  ): Promise<EmailVerification | null>;
  listByAccount(accountId: string): Promise<readonly AccountEmail[]>;
  remove(
    emailId: string,
    quarantineUntil: string,
  ): Promise<boolean>;
  saveOrganizationNotificationRoute(
    route: OrganizationNotificationRoute,
  ): Promise<void>;
  saveVerification(
    verification: EmailVerification,
  ): Promise<void>;
  setPrimary(accountId: string, emailId: string): Promise<boolean>;
  setPublic(accountId: string, emailId: string | null): Promise<boolean>;
  verify(emailId: string, tokenHash: string): Promise<boolean>;
}
