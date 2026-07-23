import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function UserProjectPage(): never {
  return unavailableRoute({
    urlPattern: "/users/{username}/projects/{number}",
    title: "User project",
    summary: "Open one project owned by a personal account.",
    contexts: ["identity/accounts", "collaboration/projects"],
    catalogStatus: "mixed",
  });
}
