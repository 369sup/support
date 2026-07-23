export type OrganizationRoleAssignedV1 = Readonly<{
  assignmentId: string;
  organizationId: string;
  roleKey: string;
  subject:
    | Readonly<{ kind: "account"; accountId: string }>
    | Readonly<{ kind: "team"; teamId: string }>;
}>;

export type OrganizationRoleRevokedV1 = Readonly<{
  assignmentId: string;
  organizationId: string;
}>;
