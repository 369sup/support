import type { EnterpriseTeamIdGeneratorPort } from "../../../application/ports/outbound/enterprise-team-id-generator.port";

type EnterpriseTeamSequence = {
  team: number;
  membership: number;
  "organization-grant": number;
};

declare global {
  var __supportEnterpriseTeamSequenceV1:
    | EnterpriseTeamSequence
    | undefined;
}

function getProcessSequence(): EnterpriseTeamSequence {
  globalThis.__supportEnterpriseTeamSequenceV1 ??= {
    team: 0,
    membership: 0,
    "organization-grant": 0,
  };
  return globalThis.__supportEnterpriseTeamSequenceV1;
}

export class InMemoryEnterpriseTeamIdGeneratorAdapter
  implements EnterpriseTeamIdGeneratorPort
{
  private readonly sequence: EnterpriseTeamSequence;

  constructor(sequence = getProcessSequence()) {
    this.sequence = sequence;
  }

  nextId(kind: "team" | "membership" | "organization-grant") {
    this.sequence[kind] += 1;
    return `enterprise_team_${kind}_${this.sequence[kind]}`;
  }
}
