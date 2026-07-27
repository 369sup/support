type OrganizationMembershipRole = "member" | "owner";

export function wouldRemoveLastOrganizationOwner(
  currentRole: OrganizationMembershipRole,
  nextRole: OrganizationMembershipRole | "removed",
  activeOwnerCount: number,
): boolean {
  return (
    currentRole === "owner" &&
    nextRole !== "owner" &&
    activeOwnerCount <= 1
  );
}
