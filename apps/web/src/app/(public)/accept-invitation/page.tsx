import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function AcceptInvitationPage(): never {
  return unavailableRoute({
    urlPattern: "/accept-invitation",
    title: "Accept invitation",
    summary: "Review and accept an organization or enterprise membership invitation.",
    contexts: [
      "enterprises/enterprise-memberships",
      "organizations/organization-memberships",
    ],
    catalogStatus: "active",
  });
}
