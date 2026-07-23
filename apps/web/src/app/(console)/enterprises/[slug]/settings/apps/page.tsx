import { notFound } from "next/navigation";

export default function EnterpriseAppsPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/settings/apps",
    title: "Enterprise GitHub Apps",
    summary: "Manage application registrations owned by an enterprise.",
    contexts: ["integrations/github-app-registrations"],
    catalogStatus: "planned",
  };
  notFound();
}
