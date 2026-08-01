export type AccountDeletionPrerequisiteResult =
  | "allowed"
  | "owns-enterprise"
  | "owns-organization"
  | "owns-repository";

export interface AccountDeletionPrerequisiteGatewayPort {
  checkAccountDeletionPrerequisites(
    accountId: string,
  ): Promise<AccountDeletionPrerequisiteResult>;
}
