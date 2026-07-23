import type { MetadataRoute } from "next";

import { siteConfig } from "../../site-configuration";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/docs", "/accessibility", "/privacy", "/terms"],
      disallow: [
        "/account",
        "/dashboard",
        "/notifications",
        "/projects",
        "/repositories",
        "/settings",
        "/accept-invitation",
        "/forgot-password",
        "/logout",
        "/reset-password",
        "/search",
        "/sign-in",
        "/sign-up",
        "/verify-email",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteConfig.url).toString(),
  };
}
