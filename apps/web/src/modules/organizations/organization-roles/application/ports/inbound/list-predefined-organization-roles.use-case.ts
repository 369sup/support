import type { PredefinedOrganizationRoleDefinition } from "../../../domain/organization-role";

export type ListPredefinedOrganizationRolesQuery = Readonly<{
  actorAccountId: string;
  organizationId: string;
}>;

export type ListPredefinedOrganizationRolesResult =
  | Readonly<{
      status: "found";
      roles: readonly PredefinedOrganizationRoleDefinition[];
    }>
  | Readonly<{ status: "membership-inactive" }>;

export interface ListPredefinedOrganizationRolesUseCase {
  listPredefinedOrganizationRoles(
    query: ListPredefinedOrganizationRolesQuery,
  ): Promise<ListPredefinedOrganizationRolesResult>;
}
