import { notFound } from "next/navigation";

export default function NewRepositoryPage(): never {
  void {
    urlPattern: "/new",
    title: "New repository",
    summary: "Create a repository for a permitted user or organization owner.",
    contexts: ["repositories/repositories"],
    catalogStatus: "active",
  };
  notFound();
}
