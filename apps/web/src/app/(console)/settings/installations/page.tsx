import { notFound } from "next/navigation";

export default function InstallationsSettingsPage(): never {
  void {
    urlPattern: "/settings/installations",
    title: "Installed GitHub Apps",
    summary: "Review application installations available to the account.",
    contexts: ["integrations/github-app-installations"],
    catalogStatus: "planned",
  };
  notFound();
}
