import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function SignUpPage(): never {
  return unavailableRoute({
    urlPattern: "/sign-up",
    title: "Create an account",
    summary: "Create a personal account and its authentication credentials.",
    contexts: ["identity/accounts", "identity/authentication"],
    catalogStatus: "active",
  });
}
