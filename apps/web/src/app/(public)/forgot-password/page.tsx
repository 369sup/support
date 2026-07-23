import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function ForgotPasswordPage(): never {
  return unavailableRoute({
    urlPattern: "/forgot-password",
    title: "Forgot password",
    summary: "Request a credential recovery flow for an account.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
