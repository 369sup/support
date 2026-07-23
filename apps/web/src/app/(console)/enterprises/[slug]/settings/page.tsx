import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseSettingsPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/settings",
    title: "Enterprise settings",
    summary: "Open the enterprise settings entry point for IAM, policies, and custom properties.",
    contexts: [
      "enterprises/enterprise-iam",
      "enterprises/enterprise-policies",
      "enterprises/custom-properties",
    ],
    catalogStatus: "planned",
  });
}
