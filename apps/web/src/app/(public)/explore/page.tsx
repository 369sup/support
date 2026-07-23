import { notFound } from "next/navigation";

export default function ExplorePage(): never {
  void {
    urlPattern: "/explore",
    title: "Explore",
    summary: "Reserve the GitHub-style public discovery entry point without assigning product ownership.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
