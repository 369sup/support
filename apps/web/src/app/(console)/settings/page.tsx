import { notFound } from "next/navigation";

export default function SettingsPage(): never {
  void {
    urlPattern: "/settings",
    title: "Settings",
    summary: "Open the account-level settings entry point for identity, integrations, and billing.",
    contexts: [
      "identity/authentication",
      "integrations/oauth-authorizations",
      "commerce/billing",
    ],
    catalogStatus: "mixed",
  };
  notFound();
}
