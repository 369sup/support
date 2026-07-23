import type { TeamRepositoryGrantIdGeneratorPort } from "../../../application/ports/outbound/team-repository-grant-id-generator.port";

declare global {
  var __supportTeamRepositoryGrantIdCounterV1: number | undefined;
}

export class InMemoryTeamRepositoryGrantIdGeneratorAdapter
  implements TeamRepositoryGrantIdGeneratorPort
{
  private counter: number | null;

  constructor(initialCounter?: number) {
    this.counter = initialCounter ?? null;
  }

  nextTeamGrantId() {
    if (this.counter === null) {
      globalThis.__supportTeamRepositoryGrantIdCounterV1 ??= 100;
      globalThis.__supportTeamRepositoryGrantIdCounterV1 += 1;
      return `team_repository_grant_${globalThis.__supportTeamRepositoryGrantIdCounterV1}`;
    }
    this.counter += 1;
    return `team_repository_grant_${this.counter}`;
  }
}
