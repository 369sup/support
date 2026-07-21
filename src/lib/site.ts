const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const siteConfig = {
  name: "Support",
  description: "A production-ready Next.js and shadcn/ui workspace.",
  url: new URL(configuredUrl),
};
