import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function LogoutPage(): never {
  return unavailableRoute({
    urlPattern: "/logout",
    title: "Log out",
    summary: "End the active account session without exposing session credentials.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
