export interface OrganizationMembershipIdGeneratorPort {
  nextId(kind: "invitation" | "membership"): string;
}
