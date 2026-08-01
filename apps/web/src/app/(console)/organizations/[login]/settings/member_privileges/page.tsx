import { notFound } from "next/navigation";

export default function MemberPrivilegesPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/member_privileges",
    title: "Member privileges",
    summary: "Configure organization-wide member and repository privilege policies.",
    contexts: ["organizations/organization-policies"],
    catalogStatus: "planned",
  };
  notFound();
}
