const localSiteUrl = "http://localhost:3000";

export function resolveSiteUrl(
  configuredUrl = process.env["NEXT_PUBLIC_SITE_URL"],
  vercelProductionDomain = process.env["VERCEL_PROJECT_PRODUCTION_URL"],
): URL {
  const normalizedConfiguredUrl = configuredUrl?.trim();
  if (
    normalizedConfiguredUrl !== undefined &&
    normalizedConfiguredUrl !== ""
  ) {
    return new URL(normalizedConfiguredUrl);
  }

  const normalizedVercelProductionDomain = vercelProductionDomain?.trim();
  if (
    normalizedVercelProductionDomain !== undefined &&
    normalizedVercelProductionDomain !== ""
  ) {
    return new URL(`https://${normalizedVercelProductionDomain}`);
  }

  return new URL(localSiteUrl);
}

export const siteConfig = {
  name: "Support",
  description: "A GitHub-like platform for non-code collaboration and governance.",
  url: resolveSiteUrl(),
};
