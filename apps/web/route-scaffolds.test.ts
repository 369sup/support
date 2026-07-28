import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import routeMap from "./route-map.json";
import {
  deriveSupportPath,
  discoverAppRoutes,
} from "../../scripts/architecture/routes.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..", "..");

describe("App Router route catalog", () => {
  it("covers all 135 public delivery files and excludes parallel fallbacks", () => {
    const files = discoverAppRoutes(repositoryRoot);
    const catalogFiles = routeMap.routes
      .flatMap((route) => "file" in route ? [route.file] : [])
      .sort();

    expect(files).toHaveLength(135);
    expect(catalogFiles).toEqual(files);
    expect(catalogFiles.some((file) => file.includes("/@"))).toBe(false);
  });

  it("keeps filesystem-derived paths aligned with the catalog", () => {
    for (const route of routeMap.routes) {
      if (route.file === undefined) {
        continue;
      }

      expect(deriveSupportPath(route.file), route.id).toBe(route.supportPath);
    }
  });

  it("binds every unavailable page to one typed route ID", () => {
    const scaffolded = routeMap.routes.filter(
      (route) => route.materialization === "scaffolded",
    );

    expect(scaffolded).toHaveLength(59);

    for (const route of scaffolded) {
      if (!("file" in route)) {
        throw new TypeError(`${route.id} must declare a file.`);
      }

      const contents = readFileSync(
        resolve(repositoryRoot, route.file),
        "utf8",
      );

      expect(contents, route.id).toContain(
        `return renderUnavailableRoute("${route.id}");`,
      );
      expect(contents, route.id).not.toContain("void {");
      expect(contents, route.id).not.toContain('from "next/navigation"');
    }
  });

  it("keeps documented-only URLs free of delivery files", () => {
    const documentedOnly = routeMap.routes.filter(
      (route) => route.materialization === "documented-only",
    );

    expect(documentedOnly).toHaveLength(1);

    for (const route of documentedOnly) {
      const directory = dirname(resolve(repositoryRoot, route.readme));
      expect(existsSync(resolve(directory, "page.tsx")), route.id).toBe(false);
      expect(existsSync(resolve(directory, "route.ts")), route.id).toBe(false);
    }
  });
});
