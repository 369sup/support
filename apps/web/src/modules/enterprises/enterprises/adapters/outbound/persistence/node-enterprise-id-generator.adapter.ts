import "server-only";
import { randomUUID } from "node:crypto";
import type { EnterpriseIdGeneratorPort } from "../../../application/ports/outbound/enterprise-id-generator.port";

export class NodeEnterpriseIdGeneratorAdapter
  implements EnterpriseIdGeneratorPort
{
  nextEnterpriseId(): string {
    return randomUUID();
  }
}
