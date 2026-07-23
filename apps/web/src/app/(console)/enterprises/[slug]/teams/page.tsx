import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function EnterpriseTeamsPage(): never {
  return unavailableRoute({
    urlPattern: "/enterprises/{slug}/teams",
    title: "Enterprise teams",
    summary: "List enterprise-owned team definitions and organization connections.",
    contexts: ["enterprises/enterprise-teams"],
    catalogStatus: "planned",
  });
}
