import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./src/app/_configuration/site";

describe("site URL configuration", () => {
  it("prefers an explicit site URL", () => {
    expect(
      resolveSiteUrl("https://support.example.com", "support.vercel.app"),
    ).toEqual(new URL("https://support.example.com"));
  });

  it("uses the Vercel production domain when no override exists", () => {
    expect(resolveSiteUrl(undefined, "support.vercel.app")).toEqual(
      new URL("https://support.vercel.app"),
    );
  });

  it("uses localhost outside a configured deployment", () => {
    expect(resolveSiteUrl(undefined, undefined)).toEqual(
      new URL("http://localhost:3000"),
    );
  });
});
