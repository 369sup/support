export interface EnterpriseTeamIdGeneratorPort {
  nextId(kind: "team" | "membership" | "organization-grant"): string;
}
