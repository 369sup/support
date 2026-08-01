import { notFound } from "next/navigation";

export default function UserProjectPage(): never {
  void {
    urlPattern: "/users/{username}/projects/{number}",
    title: "User project",
    summary: "Open one project owned by a personal account.",
    contexts: ["identity/accounts", "collaboration/projects"],
    catalogStatus: "mixed",
  };
  notFound();
}
