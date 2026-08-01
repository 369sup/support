import { notFound } from "next/navigation";

export default function DeveloperSettingsPage(): never {
  void {
    urlPattern: "/settings/developers",
    title: "Developer settings",
    summary: "Open the account-level integration registration settings entry point.",
    contexts: [
      "integrations/github-app-registrations",
      "integrations/oauth-app-registrations",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
