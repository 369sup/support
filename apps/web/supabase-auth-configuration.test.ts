import { describe, expect, it } from "vitest";

import { resolveWebAuthenticationConfiguration } from "./supabase-auth-configuration";

describe("resolveWebAuthenticationConfiguration", () => {
  it("disables authentication for the isolated memory runtime", () => {
    expect(
      resolveWebAuthenticationConfiguration({
        SUPPORT_RUNTIME_MODE: "memory",
      }),
    ).toEqual({ provider: "unavailable" });
  });

  it("selects Supabase Auth for the Supabase PostgreSQL runtime", () => {
    expect(
      resolveWebAuthenticationConfiguration({
        DATABASE_PROVIDER: "supabase",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        SUPABASE_URL: "https://project.supabase.co",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toEqual({
      provider: "supabase",
      supabase: {
        publishableKey: "sb_publishable_example",
        url: "https://project.supabase.co",
      },
    });
  });

  it("disables authentication when Supabase Auth values are incomplete", () => {
    expect(
      resolveWebAuthenticationConfiguration({
        DATABASE_PROVIDER: "supabase",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toEqual({ provider: "unavailable" });
  });

  it("disables authentication without durable Supabase PostgreSQL", () => {
    expect(
      resolveWebAuthenticationConfiguration({
        DATABASE_PROVIDER: "postgres",
        SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        SUPABASE_URL: "https://project.supabase.co",
        SUPPORT_RUNTIME_MODE: "postgres",
      }),
    ).toEqual({ provider: "unavailable" });
  });
});
