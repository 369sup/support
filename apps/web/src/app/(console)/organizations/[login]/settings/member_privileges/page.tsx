import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function MemberPrivilegesPage(): never {
  return unavailableRoute({
    urlPattern: "/organizations/{organization}/settings/member_privileges",
    title: "Member privileges",
    summary: "Configure organization-wide member and repository privilege policies.",
    contexts: ["organizations/organization-policies"],
    catalogStatus: "planned",
  });
}
