import "server-only";

import { randomUUID } from "node:crypto";

import type { EnterpriseTeamIdGeneratorPort } from "../../../application/ports/outbound/enterprise-team-id-generator.port";

export class NodeEnterpriseTeamIdGeneratorAdapter
  implements EnterpriseTeamIdGeneratorPort
{
  nextId(kind: "team" | "membership" | "organization-grant") {
    return `enterprise_team_${kind}_${randomUUID()}`;
  }
}
