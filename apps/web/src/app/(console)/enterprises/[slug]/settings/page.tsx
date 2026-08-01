import { notFound } from "next/navigation";

export default function EnterpriseSettingsPage(): never {
  void {
    urlPattern: "/enterprises/{slug}/settings",
    title: "Enterprise settings",
    summary: "Open the enterprise settings entry point for IAM, policies, and custom properties.",
    contexts: [
      "enterprises/enterprise-iam",
      "enterprises/enterprise-policies",
      "enterprises/custom-properties",
    ],
    catalogStatus: "planned",
  };
  notFound();
}
