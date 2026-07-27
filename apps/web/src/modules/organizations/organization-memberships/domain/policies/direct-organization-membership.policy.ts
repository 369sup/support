type OrganizationMembershipSource =
  | "direct"
  | "enterprise-managed"
  | "identity-provider-group";

export function canChangeDirectOrganizationMembership(
  source: OrganizationMembershipSource,
): boolean {
  return source === "direct";
}
