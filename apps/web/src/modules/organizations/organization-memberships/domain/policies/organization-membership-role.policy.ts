type OrganizationMembershipRole = "member" | "owner";

export function isOrganizationMembershipRole(
  value: string,
): value is OrganizationMembershipRole {
  return value === "member" || value === "owner";
}
