import "server-only";
import { randomUUID } from "node:crypto";
import type { RepositoryIdGeneratorPort } from "../../../application/ports/outbound/repository-id-generator.port";

export class NodeRepositoryIdGeneratorAdapter
  implements RepositoryIdGeneratorPort
{
  nextRepositoryId(): string {
    return randomUUID();
  }
}
