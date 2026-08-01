import { describe, expect, it } from "vitest";

import { resolveWebAuthenticationConfiguration } from "./supabase-auth-configuration";

describe("resolveWebAuthenticationConfiguration", () => {
  it("selects Supabase Auth", () => {
    expect(
      resolveWebAuthenticationConfiguration({
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        SUPABASE_URL: "https://project.supabase.co",
      }),
    ).toEqual({
      provider: "supabase",
      supabase: {
        publishableKey: "sb_publishable_example",
        url: "https://project.supabase.co",
      },
    });
  });

  it("fails closed when Supabase Auth values are incomplete", () => {
    expect(() =>
      resolveWebAuthenticationConfiguration({}),
    ).toThrow("required");
  });
});
