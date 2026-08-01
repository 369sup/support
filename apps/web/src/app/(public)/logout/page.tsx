import { notFound } from "next/navigation";

export default function LogoutPage(): never {
  void {
    urlPattern: "/logout",
    title: "Log out",
    summary: "End the active account session without exposing session credentials.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
