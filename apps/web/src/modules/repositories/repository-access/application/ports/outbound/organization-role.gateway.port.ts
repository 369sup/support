export type OrganizationRolePermissionSnapshot = Readonly<{
  assignmentId: string;
  roleKey: string;
  subject:
    | Readonly<{ kind: "account"; accountId: string }>
    | Readonly<{ kind: "team"; teamId: string }>;
  permission: "read" | "triage" | "write" | "maintain" | "admin";
}>;

export interface OrganizationRoleGatewayPort {
  listRepositoryPermissionContributions(
    accountId: string,
    organizationId: string,
  ): Promise<readonly OrganizationRolePermissionSnapshot[]>;
}
