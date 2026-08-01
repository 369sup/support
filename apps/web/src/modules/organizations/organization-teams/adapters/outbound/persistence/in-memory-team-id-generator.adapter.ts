import type { TeamIdGeneratorPort } from "../../../application/ports/outbound/team-id-generator.port";

declare global {
  var __supportOrganizationTeamIdCounterV1: number | undefined;
}

export class InMemoryTeamIdGeneratorAdapter implements TeamIdGeneratorPort {
  private counter: number | null;

  constructor(initialCounter?: number) {
    this.counter = initialCounter ?? null;
  }

  nextId(kind: "team" | "membership" | "maintainer") {
    if (this.counter === null) {
      globalThis.__supportOrganizationTeamIdCounterV1 ??= 100;
      globalThis.__supportOrganizationTeamIdCounterV1 += 1;
      return `${kind}_${globalThis.__supportOrganizationTeamIdCounterV1}`;
    }
    this.counter += 1;
    return `${kind}_${this.counter}`;
  }
}
