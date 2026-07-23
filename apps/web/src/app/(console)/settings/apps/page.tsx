import { notFound } from "next/navigation";

export default function AppsSettingsPage(): never {
  void {
    urlPattern: "/settings/apps",
    title: "GitHub Apps",
    summary: "Manage account-owned application registrations.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  };
  notFound();
}
