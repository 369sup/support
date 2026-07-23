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
] as const;

const excludedRouteSegments = [
  "/actions",
  "/archive",
  "/blame",
  "/blob",
  "/branches",
  "/codespaces",
  "/commit",
  "/commits",
  "/compare",
  "/models",
  "/packages",
  "/pages",
  "/pull",
  "/pulls",
  "/raw",
  "/releases",
  "/security",
  "/tags",
  "/tree",
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

  it("keeps excluded and deferred code-product URLs out of the scaffold", () => {
    for (const urlPattern of expectedUrlPatterns) {
      for (const excludedSegment of excludedRouteSegments) {
        expect(urlPattern).not.toContain(excludedSegment);
      }
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

  it("uses a single not-found boundary for unavailable route scaffolds", () => {
    const helper = readFileSync(
      resolve(appRoot, "_route-scaffold", "unavailable-route.ts"),
      "utf8",
    );

    expect(helper).toContain('import { notFound } from "next/navigation"');
    expect(helper).toContain("notFound();");
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
    if (content.includes("unavailableRoute")) {
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
    .map((segment) =>
      segment.startsWith("[") && segment.endsWith("]")
        ? `{${segment.slice(1, -1)}}`
        : segment,
    );
  return `/${segments.join("/")}`;
}

function normalizeDynamicSegments(pattern: string): string {
  return pattern.replaceAll(/\{[^}]+\}/g, "{}");
}
