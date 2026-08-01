import type { BaseRepositoryPermission } from "../../../domain/organization-app-access-policy";

export type GetOrganizationBaseRepositoryPermissionQuery = Readonly<{
  organizationId: string;
}>;

export type GetOrganizationBaseRepositoryPermissionResult = Readonly<{
  status: "found";
  permission: BaseRepositoryPermission | null;
}>;

export interface GetOrganizationBaseRepositoryPermissionUseCase {
  getOrganizationBaseRepositoryPermission(
    query: GetOrganizationBaseRepositoryPermissionQuery,
  ): Promise<GetOrganizationBaseRepositoryPermissionResult>;
}
