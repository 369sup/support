import "server-only";
import { randomUUID } from "node:crypto";
import type { TeamIdGeneratorPort } from "../../../application/ports/outbound/team-id-generator.port";

export class NodeTeamIdGeneratorAdapter implements TeamIdGeneratorPort {
  nextId(): string {
    return randomUUID();
  }
}
