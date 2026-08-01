import "server-only";
import { randomUUID } from "node:crypto";
import type { TeamRepositoryGrantIdGeneratorPort } from "../../../application/ports/outbound/team-repository-grant-id-generator.port";

export class NodeTeamRepositoryGrantIdGeneratorAdapter
  implements TeamRepositoryGrantIdGeneratorPort
{
  nextTeamGrantId(): string {
    return randomUUID();
  }
}
