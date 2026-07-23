import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function NewRepositoryPage(): never {
  return unavailableRoute({
    urlPattern: "/new",
    title: "New repository",
    summary: "Create a repository for a permitted user or organization owner.",
    contexts: ["repositories/repositories"],
    catalogStatus: "active",
  });
}
