export type CreateOrganizationCommand = Readonly<{
  actorAccountId: string;
  login: string;
  displayName: string;
}>;

export type CreateOrganizationResult =
  | Readonly<{ status: "created"; organizationId: string; login: string }>
  | Readonly<{
      status:
        | "invalid-login"
        | "invalid-display-name"
        | "login-conflict"
        | "service-unavailable";
    }>;

export interface CreateOrganizationUseCase {
  createOrganization(
    command: CreateOrganizationCommand,
  ): Promise<CreateOrganizationResult>;
}
