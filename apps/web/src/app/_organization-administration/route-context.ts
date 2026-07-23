import { getOptionalCurrentSession } from "@/app/_authentication/current-session";
import { getOrganizationByLogin } from "@/modules/organizations/organizations/server-api";

export async function resolveOrganizationRouteContext(login: string) {
  const session = await getOptionalCurrentSession();
  if (session === null) {
    return { status: "authentication-required" as const };
  }
  const organization = await getOrganizationByLogin(login);
  if (organization.status !== "found") {
    return { status: "organization-not-found" as const };
  }
  return {
    status: "resolved" as const,
    session,
    organization: organization.organization,
  };
}
