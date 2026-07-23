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
});
