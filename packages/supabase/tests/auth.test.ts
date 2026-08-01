import { describe, expect, it } from "vitest";

import { resolveSupabaseAuthConfiguration } from "../src/auth";

describe("resolveSupabaseAuthConfiguration", () => {
  it("accepts a managed HTTPS endpoint and publishable key", () => {
    expect(
      resolveSupabaseAuthConfiguration({
        publishableKey: "sb_publishable_example",
        url: "https://project.supabase.co/",
      }),
    ).toEqual({
      publishableKey: "sb_publishable_example",
      url: "https://project.supabase.co",
    });
  });

  it("accepts HTTP only for local development", () => {
    expect(
      resolveSupabaseAuthConfiguration({
        publishableKey: "local-publishable-key",
        url: "http://127.0.0.1:54321",
      }),
    ).toEqual({
      publishableKey: "local-publishable-key",
      url: "http://127.0.0.1:54321",
    });
    expect(() =>
      resolveSupabaseAuthConfiguration({
        publishableKey: "sb_publishable_example",
        url: "http://project.supabase.co",
      }),
    ).toThrow("must use HTTPS");
  });

  it("rejects URL credentials and query parameters", () => {
    expect(() =>
      resolveSupabaseAuthConfiguration({
        publishableKey: "sb_publishable_example",
        url: "https://user:password@project.supabase.co?secret=value",
      }),
    ).toThrow("unsupported components");
  });

  it("rejects privileged keys without exposing their value", () => {
    const secret = "sb_secret_do-not-log-this";
    expect(() =>
      resolveSupabaseAuthConfiguration({
        publishableKey: secret,
        url: "https://project.supabase.co",
      }),
    ).toThrow("publishable key");
    try {
      resolveSupabaseAuthConfiguration({
        publishableKey: secret,
        url: "https://project.supabase.co",
      });
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });
});
