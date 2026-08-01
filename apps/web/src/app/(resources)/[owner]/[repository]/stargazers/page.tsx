import { notFound } from "next/navigation";

export default function StargazersPage(): never {
  void {
    urlPattern: "/{owner}/{repository}/stargazers",
    title: "Stargazers",
    summary: "List accounts that starred a repository when visibility permits.",
    contexts: ["engagement/stars"],
    catalogStatus: "planned",
  };
  notFound();
}
