import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const appRoot = fileURLToPath(new URL("./src/app", import.meta.url));

const expectedUrlPatterns = [
  "/accept-invitation",
  "/forgot-password",
  "/login",
  "/logout",
  "/reset-password",
  "/search",
  "/sign-up",
  "/signup",
  "/verify-email",
  "/explore",
  "/topics",
  "/topics/{topic}",
  "/trending",
  "/collections",
  "/marketplace",
  "/new",
  "/notifications",
  "/projects",
  "/settings",
  "/settings/sessions",
  "/settings/apps",
  "/settings/installations",
  "/settings/developers",
  "/settings/applications",
  "/settings/billing",
  "/{owner}",
  "/orgs/{organization}/repositories",
  "/orgs/{organization}/people",
  "/orgs/{organization}/teams",
  "/orgs/{organization}/teams/{teamSlug}",
  "/orgs/{organization}/projects",
  "/orgs/{organization}/projects/{number}",
  "/users/{username}/projects/{number}",
  "/organizations/{organization}/settings/member_privileges",
  "/organizations/{organization}/settings/custom_properties",
  "/organizations/{organization}/settings/apps",
  "/organizations/{organization}/settings/installations",
  "/organizations/{organization}/settings/installations/{installationId}",
  "/organizations/{organization}/settings/hooks",
  "/organizations/{organization}/settings/billing",
  "/organizations/{organization}/settings/audit-log",
  "/enterprises/{slug}/organizations",
  "/enterprises/{slug}/people",
  "/enterprises/{slug}/teams",
  "/enterprises/{slug}/enterprise_roles",
  "/enterprises/{slug}/settings",
  "/enterprises/{slug}/settings/apps",
  "/enterprises/{slug}/settings/billing",
  "/enterprises/{slug}/settings/audit-log",
  "/{owner}/{repository}",
  "/{owner}/{repository}/settings",
  "/{owner}/{repository}/settings/access",
  "/{owner}/{repository}/settings/hooks",
  "/{owner}/{repository}/issues",
  "/{owner}/{repository}/issues/views",
  "/{owner}/{repository}/issues/new",
  "/{owner}/{repository}/issues/{number}",
  "/{owner}/{repository}/labels",
  "/{owner}/{repository}/labels/{label}",
  "/{owner}/{repository}/milestones",
  "/{owner}/{repository}/milestone/{number}",
  "/{owner}/{repository}/discussions",
  "/{owner}/{repository}/discussions/new",
  "/{owner}/{repository}/discussions/{number}",
  "/{owner}/{repository}/discussions/categories/{slug}",
  "/{owner}/{repository}/projects",
  "/{owner}/{repository}/stargazers",
  "/{owner}/{repository}/watchers",
  "/{owner}/{repository}/activity",
  "/{owner}/{repository}/pulse",
  "/{owner}/{repository}/custom-properties",
  "/{owner}/{repository}/tree/{*refAndPath}",
  "/{owner}/{repository}/blob/{*refAndPath}",
  "/{owner}/{repository}/raw/{*refAndPath}",
  "/{owner}/{repository}/blame/{*refAndPath}",
  "/{owner}/{repository}/commit/{sha}",
  "/{owner}/{repository}/commits/{*refAndPath}",
  "/{owner}/{repository}/branches",
  "/{owner}/{repository}/branches/{view}",
  "/{owner}/{repository}/tags",
  "/{owner}/{repository}/compare",
  "/{owner}/{repository}/compare/{*comparison}",
  "/{owner}/{repository}/pull/{*pullPath}",
  "/{owner}/{repository}/pulls",
  "/{owner}/{repository}/actions",
  "/{owner}/{repository}/actions/{*actionPath}",
  "/{owner}/{repository}/packages",
  "/{owner}/{repository}/pages",
  "/{owner}/{repository}/releases",
  "/{owner}/{repository}/releases/latest",
  "/{owner}/{repository}/releases/tag/{*tag}",
  "/{owner}/{repository}/releases/download/{*assetPath}",
  "/{owner}/{repository}/archive/{*archivePath}",
  "/{owner}/{repository}/forks",
  "/{owner}/{repository}/community",
  "/{owner}/{repository}/wiki",
  "/{owner}/{repository}/wiki/{*pageName}",
  "/{owner}/{repository}/graphs/traffic",
] as const;

const unownedUrlPatterns = [
  "/explore",
  "/topics",
  "/topics/{topic}",
  "/trending",
  "/collections",
  "/marketplace",
] as const;

const excludedUrlPatterns = [
  "/{owner}/{repository}/tree/{*refAndPath}",
  "/{owner}/{repository}/blob/{*refAndPath}",
  "/{owner}/{repository}/raw/{*refAndPath}",
  "/{owner}/{repository}/blame/{*refAndPath}",
  "/{owner}/{repository}/commit/{sha}",
  "/{owner}/{repository}/commits/{*refAndPath}",
  "/{owner}/{repository}/branches",
  "/{owner}/{repository}/branches/{view}",
  "/{owner}/{repository}/tags",
  "/{owner}/{repository}/compare",
  "/{owner}/{repository}/compare/{*comparison}",
  "/{owner}/{repository}/pull/{*pullPath}",
  "/{owner}/{repository}/pulls",
  "/{owner}/{repository}/actions",
  "/{owner}/{repository}/actions/{*actionPath}",
  "/{owner}/{repository}/packages",
  "/{owner}/{repository}/pages",
  "/{owner}/{repository}/archive/{*archivePath}",
] as const;

const deferredUrlPatterns = [
  "/{owner}/{repository}/releases",
  "/{owner}/{repository}/releases/latest",
  "/{owner}/{repository}/releases/tag/{*tag}",
  "/{owner}/{repository}/releases/download/{*assetPath}",
  "/{owner}/{repository}/forks",
  "/{owner}/{repository}/community",
  "/{owner}/{repository}/wiki",
  "/{owner}/{repository}/wiki/{*pageName}",
  "/{owner}/{repository}/graphs/traffic",
] as const;

describe("App Router route scaffolds", () => {
  it("defines every approved URL as a summarized unavailable page", () => {
    const scaffolds = findScaffoldPages(appRoot);
    const declaredPatterns = scaffolds.map(({ content }) =>
      readStringField(content, "urlPattern"),
    );

    expect(declaredPatterns.sort()).toEqual([...expectedUrlPatterns].sort());

    for (const scaffold of scaffolds) {
      const urlPattern = readStringField(scaffold.content, "urlPattern");
      expect(scaffold.content).toContain("summary:");
      expect(scaffold.content).toContain("contexts:");
      expect(scaffold.content).toContain("catalogStatus:");
      expect(normalizeDynamicSegments(toRoutePattern(scaffold.file))).toBe(
        normalizeDynamicSegments(urlPattern),
      );
    }
  });

  it("marks reserved, excluded, and deferred route families explicitly", () => {
    const scaffolds = new Map(
      findScaffoldPages(appRoot).map(({ content }) => [
        readStringField(content, "urlPattern"),
        content,
      ]),
    );

    for (const urlPattern of unownedUrlPatterns) {
      expect(scaffolds.get(urlPattern)).toContain(
        'catalogStatus: "unowned"',
      );
    }
    for (const urlPattern of excludedUrlPatterns) {
      expect(scaffolds.get(urlPattern)).toContain(
        'catalogStatus: "excluded"',
      );
    }
    for (const urlPattern of deferredUrlPatterns) {
      expect(scaffolds.get(urlPattern)).toContain(
        'catalogStatus: "deferred"',
      );
    }

    const insightsPage = readFileSync(
      resolve(
        appRoot,
        "(resources)",
        "[owner]",
        "[repository]",
        "pulse",
        "page.tsx",
      ),
      "utf8",
    );
    expect(insightsPage).toContain("without traffic or Git metrics");
  });

  it("uses the official not-found API directly in every unavailable page", () => {
    for (const scaffold of findScaffoldPages(appRoot)) {
      expect(scaffold.content).toContain(
        'import { notFound } from "next/navigation"',
      );
      expect(scaffold.content).toContain("notFound();");
      expect(scaffold.content).not.toContain("unavailableRoute");
    }
  });
});

describe("App Router parallel shells", () => {
  const routeGroups = ["(public)", "(console)", "(resources)"] as const;
  const slots = ["header", "navigation", "sidebar", "modal"] as const;

  for (const routeGroup of routeGroups) {
    it(`${routeGroup} defines every slot and hard-navigation fallback`, () => {
      const layout = readFileSync(
        resolve(appRoot, routeGroup, "layout.tsx"),
        "utf8",
      );

      expect(
        readFileSync(resolve(appRoot, routeGroup, "default.tsx"), "utf8"),
      ).toContain(
        "notFound();",
      );
      for (const slot of slots) {
        expect(layout).toContain(`${slot}?: React.ReactNode`);
        expect(
          existsSync(
            resolve(appRoot, routeGroup, `@${slot}`, "default.tsx"),
          ),
        ).toBe(true);
      }
      expect(
        existsSync(
          resolve(
            appRoot,
            routeGroup,
            "@modal",
            "[...catchAll]",
            "page.tsx",
          ),
        ),
      ).toBe(true);
    });
  }
});

function findScaffoldPages(directory: string): Array<{
  file: string;
  content: string;
}> {
  const pages: Array<{ file: string; content: string }> = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...findScaffoldPages(path));
      continue;
    }
    if (entry.name !== "page.tsx") {
      continue;
    }
    const content = readFileSync(path, "utf8");
    if (content.includes("catalogStatus:")) {
      pages.push({ file: path, content });
    }
  }

  return pages;
}

function readStringField(content: string, field: string): string {
  const match = content.match(
    new RegExp(`${field}:\\s*["'](?<value>[^"']+)["']`),
  );
  if (match?.groups?.["value"] === undefined) {
    throw new Error(`Missing ${field} in route scaffold.`);
  }
  return match.groups["value"];
}

function toRoutePattern(file: string): string {
  const relative = file
    .slice(appRoot.length)
    .replaceAll("\\", "/")
    .replace(/\/page\.tsx$/, "");
  const segments = relative
    .split("/")
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map((segment) => {
      if (segment.startsWith("[...") && segment.endsWith("]")) {
        return `{*${segment.slice(4, -1)}}`;
      }
      return segment.startsWith("[") && segment.endsWith("]")
        ? `{${segment.slice(1, -1)}}`
        : segment;
    });
  return `/${segments.join("/")}`;
}

function normalizeDynamicSegments(pattern: string): string {
  return pattern.replaceAll(/\{[^}]+\}/g, "{}");
}
