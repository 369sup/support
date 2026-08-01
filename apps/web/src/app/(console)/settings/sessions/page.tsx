import { notFound } from "next/navigation";

export default function SessionsSettingsPage(): never {
  void {
    urlPattern: "/settings/sessions",
    title: "Sessions",
    summary: "Review and revoke browser account sessions.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
