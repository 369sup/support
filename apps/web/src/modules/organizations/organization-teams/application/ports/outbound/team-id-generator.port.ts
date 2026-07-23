export interface TeamIdGeneratorPort {
  nextId(kind: "team" | "membership" | "maintainer"): string;
}
