import { describe, expect, it } from "vitest";

import {
  buildAppPath,
  buildLinkHref,
  getRouteDefinition,
} from "./src/app/_route-contracts/route-contract";

describe("route contracts", () => {
  it("builds static and dynamic paths", () => {
    expect(buildAppPath("page-login", {}, {})).toBe("/login");
    expect(
      buildAppPath(
        "page-owner-repository-settings",
        { owner: "octo cat", repository: "support" },
        {},
      ),
    ).toBe("/octo%20cat/support/settings");
  });

  it("encodes catch-all segments independently", () => {
    expect(
      buildAppPath(
        "page-owner-repository-tree-refandpath",
        {
          owner: "octo",
          repository: "support",
          refAndPath: ["feature/one", "文件 name"],
        },
        {},
      ),
    ).toBe(
      "/octo/support/tree/feature%2Fone/%E6%96%87%E4%BB%B6%20name",
    );
  });

  it("rejects a slash in scalar path parameters", () => {
    expect(() =>
      buildAppPath(
        "page-owner-repository",
        { owner: "octo/cat", repository: "support" },
        {},
      )
    ).toThrow(/one non-empty segment/);
  });

  it("rejects missing and extra path parameters", () => {
    expect(() => {
      Reflect.apply(buildAppPath, undefined, [
        "page-owner-repository",
        { owner: "octo" },
        {},
      ]);
    }).toThrow(/requires path parameter repository/);
    expect(() => {
      Reflect.apply(buildAppPath, undefined, [
        "page-owner-repository",
        { owner: "octo", repository: "support", extra: "x" },
        {},
      ]);
    }).toThrow(/does not declare path parameter extra/);
  });

  it("sorts declared repeatable query values and rejects unknown keys", () => {
    expect(
      buildAppPath(
        "page-login",
        {},
        { add: ["z account", "a"] },
      ),
    ).toBe("/login?add=a&add=z+account");
    expect(() => {
      Reflect.apply(buildAppPath, undefined, [
        "page-login",
        {},
        { other: "x" },
      ]);
    }).toThrow(/does not declare query parameter other/);
  });

  it("returns typed hrefs only for navigable routes", () => {
    expect(
      buildLinkHref(
        "page-owner-repository-settings",
        { owner: "octo", repository: "support" },
        {},
      ),
    ).toBe("/octo/support/settings");
    expect(getRouteDefinition("page-marketplace").materialization).toBe(
      "scaffolded",
    );
    expect(() => {
      Reflect.apply(buildLinkHref, undefined, [
        "page-marketplace",
        {},
        {},
      ]);
    }).toThrow(/not a navigable route/);
  });
});
