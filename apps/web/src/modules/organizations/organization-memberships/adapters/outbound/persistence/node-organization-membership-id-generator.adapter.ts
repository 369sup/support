import "server-only";
import { randomUUID } from "node:crypto";
import type { OrganizationMembershipIdGeneratorPort } from "../../../application/ports/outbound/organization-membership-id-generator.port";

export class NodeOrganizationMembershipIdGeneratorAdapter
  implements OrganizationMembershipIdGeneratorPort
{
  nextId(): string {
    return randomUUID();
  }
}
