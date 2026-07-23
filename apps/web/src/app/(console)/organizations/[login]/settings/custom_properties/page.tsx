import { notFound } from "next/navigation";

export default function OrganizationCustomPropertiesPage(): never {
  void {
    urlPattern: "/organizations/{organization}/settings/custom_properties",
    title: "Organization custom properties",
    summary: "Define organization-owned custom property schemas and values.",
    contexts: ["organizations/custom-properties"],
    catalogStatus: "planned",
  };
  notFound();
}
