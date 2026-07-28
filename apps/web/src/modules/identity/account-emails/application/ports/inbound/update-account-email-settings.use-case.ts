export type UpdateAccountEmailSettingsCommand =
  | Readonly<{
      action: "set-primary" | "set-public" | "remove";
      accountId: string;
      emailId: string;
      isManagedAccount: boolean;
      isSudoMode: boolean;
    }>
  | Readonly<{
      action: "clear-public";
      accountId: string;
      isManagedAccount: boolean;
      isSudoMode: boolean;
    }>
  | Readonly<{
      action: "set-organization-notification";
      accountId: string;
      allowedDomains: readonly string[];
      emailId: string;
      isOutsideCollaborator: boolean;
      isRestrictionEnabled: boolean;
      organizationId: string;
    }>;

export type UpdateAccountEmailSettingsResult = Readonly<{
  status:
    | "email-not-found"
    | "email-not-verified"
    | "managed-by-identity-provider"
    | "notification-domain-restricted"
    | "primary-email-required"
    | "sensitive-action-required"
    | "updated";
}>;

export interface UpdateAccountEmailSettingsUseCase {
  updateAccountEmailSettings(
    command: UpdateAccountEmailSettingsCommand,
  ): Promise<UpdateAccountEmailSettingsResult>;
}
