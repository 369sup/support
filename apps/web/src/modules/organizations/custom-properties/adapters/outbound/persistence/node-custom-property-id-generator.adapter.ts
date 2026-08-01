import "server-only";
import { randomUUID } from "node:crypto";
import type { CustomPropertyIdGeneratorPort } from "../../../application/ports/outbound/custom-property.repository.port";

export class NodeCustomPropertyIdGeneratorAdapter
  implements CustomPropertyIdGeneratorPort
{
  nextPropertyId(): string {
    return randomUUID();
  }
}
