import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function ProjectsPage(): never {
  return unavailableRoute({
    urlPattern: "/projects",
    title: "Projects",
    summary: "List projects available to the active account across supported owners.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  });
}
