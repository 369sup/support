export type AuthorizeEnterpriseAdministrationQuery = Readonly<{
  accountId: string;
  enterpriseId: string;
}>;

export type AuthorizeEnterpriseAdministrationResult =
  | Readonly<{
      status: "allowed";
      roleName: "enterprise-owner" | "enterprise-admin";
      permissions: readonly ["view-enterprise"];
    }>
  | Readonly<{
      status: "denied";
      reason: "membership-inactive" | "permission-missing";
    }>;

export interface AuthorizeEnterpriseAdministrationUseCase {
  authorizeEnterpriseAdministration(
    query: AuthorizeEnterpriseAdministrationQuery,
  ): Promise<AuthorizeEnterpriseAdministrationResult>;
}
