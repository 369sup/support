export type EnterpriseRoleAssignmentSnapshot = Readonly<{
  assignmentId: string;
  enterpriseId: string;
  accountId: string;
  roleName: "enterprise-owner" | "enterprise-admin";
  permissions: readonly ("view-enterprise" | "manage-enterprise")[];
}>;

export interface EnterpriseRoleAssignmentRepositoryPort {
  findByAccountAndEnterprise(
    accountId: string,
    enterpriseId: string,
  ): Promise<readonly EnterpriseRoleAssignmentSnapshot[]>;
}
