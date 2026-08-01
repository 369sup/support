import { notFound } from "next/navigation";

export default function CollectionsPage(): never {
  void {
    urlPattern: "/collections",
    title: "Collections",
    summary: "Reserve the public curated collections entry point without assigning catalog ownership.",
    contexts: [],
    catalogStatus: "unowned",
  };
  notFound();
}
