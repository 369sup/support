import { notFound } from "next/navigation";

export default function AcceptInvitationPage(): never {
  void {
    urlPattern: "/accept-invitation",
    title: "Accept invitation",
    summary: "Review and accept an organization or enterprise membership invitation.",
    contexts: [
      "enterprises/enterprise-memberships",
      "organizations/organization-memberships",
    ],
    catalogStatus: "active",
  };
  notFound();
}
