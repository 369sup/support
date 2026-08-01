import "server-only";
import { randomUUID } from "node:crypto";
import type { OrganizationIdGeneratorPort } from "../../../application/ports/outbound/organization-id-generator.port";

export class NodeOrganizationIdGeneratorAdapter
  implements OrganizationIdGeneratorPort
{
  nextOrganizationId(): string {
    return randomUUID();
  }
}
