import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function ResetPasswordPage(): never {
  return unavailableRoute({
    urlPattern: "/reset-password",
    title: "Reset password",
    summary: "Complete an account credential recovery flow.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
