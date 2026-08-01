import "server-only";

import { randomBytes } from "node:crypto";

import { describe, expect, it } from "vitest";

import { InMemoryDevelopmentCredentialAdapter } from "./fixtures/development-credential.fixture";

const developmentPassword = randomBytes(24).toString("base64url");

describe("password credential transaction", () => {
  it("stores a new verifier, authenticates only after commit, and compensates", async () => {
    const adapter = new InMemoryDevelopmentCredentialAdapter(
      developmentPassword,
    );
    const transactionId = "credential_registration_test";
    const username = "registered-credential-test";
    const accountId = "account_credential_test";
    const password = "a-strong-password-value";

    await adapter.apply({
      action: "prepare-registration",
      transactionId,
      accountId,
      username,
      password,
    });
    await expect(adapter.authenticate(username, password)).resolves.toBeNull();
    await adapter.apply({ action: "commit", transactionId });
    await expect(adapter.authenticate(username, password)).resolves.toBe(
      accountId,
    );
    await expect(
      adapter.authenticate(username, `${password}-wrong`),
    ).resolves.toBeNull();

    await adapter.apply({ action: "rollback", transactionId });
    await expect(adapter.authenticate(username, password)).resolves.toBeNull();
  });

  it("locks authentication during username change and restores on rollback", async () => {
    const adapter = new InMemoryDevelopmentCredentialAdapter(
      developmentPassword,
    );
    const transactionId = "credential_username_test";

    await adapter.apply({
      action: "prepare-username-change",
      transactionId,
      accountId: "account_octocat",
      newUsername: "octocat-renamed",
    });
    await expect(
      adapter.authenticate("octocat", developmentPassword),
    ).resolves.toBeNull();
    await adapter.apply({ action: "commit", transactionId });
    await expect(
      adapter.authenticate("octocat-renamed", developmentPassword),
    ).resolves.toBe("account_octocat");
    await adapter.apply({ action: "rollback", transactionId });
    await expect(
      adapter.authenticate("octocat", developmentPassword),
    ).resolves.toBe("account_octocat");
    await expect(
      adapter.authenticate("octocat-renamed", developmentPassword),
    ).resolves.toBeNull();
  });
});
