import "server-only";

import { randomUUID } from "node:crypto";

import type { OrganizationRoleIdGeneratorPort } from "../../../application/ports/outbound/organization-role-id-generator.port";

export class NodeOrganizationRoleIdGeneratorAdapter
  implements OrganizationRoleIdGeneratorPort
{
  nextAssignmentId() {
    return `organization_role_assignment_${randomUUID()}`;
  }
}
