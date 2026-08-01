import { notFound } from "next/navigation";

export default function ProjectsPage(): never {
  void {
    urlPattern: "/projects",
    title: "Projects",
    summary: "List projects available to the active account across supported owners.",
    contexts: ["collaboration/projects"],
    catalogStatus: "planned",
  };
  notFound();
}
