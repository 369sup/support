import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function LoginPage(): never {
  return unavailableRoute({
    urlPattern: "/login",
    title: "Login",
    summary: "GitHub-style canonical login URL for the account authentication journey.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
