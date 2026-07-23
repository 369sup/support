import { resolveOrganizationRepositoryRoleContributions } from "@/modules/organizations/organization-roles/server-api";

import type { OrganizationRoleGatewayPort } from "../../../application/ports/outbound/organization-role.gateway.port";

export class OrganizationRoleAdapter implements OrganizationRoleGatewayPort {
  listRepositoryPermissionContributions(
    accountId: string,
    organizationId: string,
  ) {
    return resolveOrganizationRepositoryRoleContributions({
      accountId,
      organizationId,
    });
  }
}
