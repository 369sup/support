import { unavailableRoute } from "@/app/_route-scaffold/unavailable-route";

export default function VerifyEmailPage(): never {
  return unavailableRoute({
    urlPattern: "/verify-email",
    title: "Verify email",
    summary: "Verify an account email as part of the authentication lifecycle.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  });
}
