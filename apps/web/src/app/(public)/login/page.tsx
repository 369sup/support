import { notFound } from "next/navigation";

export default function LoginPage(): never {
  void {
    urlPattern: "/login",
    title: "Login",
    summary: "GitHub-style canonical login URL for the account authentication journey.",
    contexts: ["identity/authentication"],
    catalogStatus: "active",
  };
  notFound();
}
