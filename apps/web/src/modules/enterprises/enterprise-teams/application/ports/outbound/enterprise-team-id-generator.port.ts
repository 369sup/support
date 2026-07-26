export interface EnterpriseTeamIdGeneratorPort {
  nextId(kind: "team" | "membership"): string;
}
