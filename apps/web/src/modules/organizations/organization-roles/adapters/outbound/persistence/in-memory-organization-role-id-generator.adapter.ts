import type { OrganizationRoleIdGeneratorPort } from "../../../application/ports/outbound/organization-role-id-generator.port";

declare global {
  var __supportOrganizationRoleIdCounterV1: number | undefined;
}

export class InMemoryOrganizationRoleIdGeneratorAdapter
  implements OrganizationRoleIdGeneratorPort
{
  private counter: number | null;

  constructor(initialCounter?: number) {
    this.counter = initialCounter ?? null;
  }

  nextAssignmentId() {
    if (this.counter === null) {
      globalThis.__supportOrganizationRoleIdCounterV1 ??= 100;
      globalThis.__supportOrganizationRoleIdCounterV1 += 1;
      return `organization_role_assignment_${globalThis.__supportOrganizationRoleIdCounterV1}`;
    }
    this.counter += 1;
    return `organization_role_assignment_${this.counter}`;
  }
}
