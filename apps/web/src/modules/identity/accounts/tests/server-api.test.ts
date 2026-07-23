import { describe, expect, it } from "vitest";

import { getPersonalAccountByUsername } from "../server-api";

describe("accounts server API", () => {
  it("resolves the development personal-account reference", async () => {
    await expect(
      getPersonalAccountByUsername("octocat"),
    ).resolves.toEqual({
      ok: true,
      account: {
        accountId: "account_octocat",
        username: "octocat",
      },
    });
  });

  it("returns an explicit absence result", async () => {
    await expect(
      getPersonalAccountByUsername("missing"),
    ).resolves.toEqual({
      ok: false,
      error: "account-not-found",
    });
  });

  it("preserves the public invalid-username result", async () => {
    await expect(
      getPersonalAccountByUsername("   "),
    ).resolves.toEqual({
      ok: false,
      error: "invalid-username",
    });
  });

  it("reuses the composed facade without runtime configuration", async () => {
    const [first, second] = await Promise.all([
      getPersonalAccountByUsername("octocat"),
      getPersonalAccountByUsername("octocat"),
    ]);

    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
  });
});
