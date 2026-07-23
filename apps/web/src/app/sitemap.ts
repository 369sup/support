import type { MetadataRoute } from "next";

import { siteConfig } from "../../site-configuration";

const publicRoutes = ["", "/docs", "/accessibility", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({
    url: new URL(path === "" ? "/" : path, siteConfig.url).toString(),
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
