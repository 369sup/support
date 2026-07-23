import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function SignupPage(): never {
  return unavailableRoute({
    urlPattern: "/signup",
    title: "Sign up",
    summary: "GitHub-style canonical URL for personal account registration.",
    contexts: ["identity/accounts", "identity/authentication"],
    catalogStatus: "active",
  });
}
