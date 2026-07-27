export function isOrganizationInvitationExpired(
  expiresAt: string,
  currentTime: Date,
): boolean {
  const expirationTime = Date.parse(expiresAt);
  return (
    Number.isFinite(expirationTime) &&
    expirationTime <= currentTime.getTime()
  );
}
