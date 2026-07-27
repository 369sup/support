import type { OrganizationMembershipIdGeneratorPort } from "../../../application/ports/outbound/organization-membership-id-generator.port";

declare global {
  var __supportOrganizationMembershipIdSequenceV1: number | undefined;
}

export class InMemoryOrganizationMembershipIdGeneratorAdapter
  implements OrganizationMembershipIdGeneratorPort
{
  nextId(kind: "invitation" | "membership"): string {
    globalThis.__supportOrganizationMembershipIdSequenceV1 =
      (globalThis.__supportOrganizationMembershipIdSequenceV1 ?? 0) + 1;
    return `organization_${kind}_${globalThis.__supportOrganizationMembershipIdSequenceV1}`;
  }
}
