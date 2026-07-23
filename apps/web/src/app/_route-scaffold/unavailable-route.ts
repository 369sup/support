import { notFound } from "next/navigation";

export type RouteSummary = Readonly<{
  urlPattern: string;
  title: string;
  summary: string;
  contexts: readonly string[];
  catalogStatus: "active" | "planned" | "mixed";
}>;

export function unavailableRoute(summary: RouteSummary): never {
  void summary;
  notFound();
}
