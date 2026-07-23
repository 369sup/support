import { notFound } from "next/navigation";

export default function ApplicationsSettingsPage(): never {
  void {
    urlPattern: "/settings/applications",
    title: "Applications",
    summary: "Review OAuth applications and account authorizations.",
    contexts: [
      "integrations/oauth-app-registrations",
      "integrations/oauth-authorizations",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
