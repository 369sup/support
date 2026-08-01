import { describe, expect, it } from "vitest";

import { InMemoryAccountEmailAdapter } from "../adapters/outbound/persistence/in-memory-account-email.adapter";
import { GetVerifiedAccountIdByEmailHandler } from "../application/queries/get-verified-account-id-by-email.handler";
import type { AccountEmail } from "../domain/account-email";

function createRepository(emails: readonly AccountEmail[]) {
  return new InMemoryAccountEmailAdapter({
    emails: new Map(emails.map((email) => [email.emailId, email])),
    quarantineByAddress: new Map(),
    routes: new Map(),
    verifications: new Map(),
  });
}

describe("GetVerifiedAccountIdByEmailHandler", () => {
  it("returns only the account that owns a verified normalized address", async () => {
    const handler = new GetVerifiedAccountIdByEmailHandler(
      createRepository([
        {
          accountId: "account_1",
          address: "octocat@example.com",
          createdAt: "2026-07-30T00:00:00.000Z",
          emailId: "email_1",
          isPrimary: true,
          isPublic: false,
          isVerified: true,
          ownership: "personal",
        },
      ]),
    );

    await expect(
      handler.getVerifiedAccountIdByEmail({
        email: " Octocat@Example.com ",
      }),
    ).resolves.toEqual({
      accountId: "account_1",
      status: "found",
    });
  });

  it("conceals missing and unverified addresses", async () => {
    const handler = new GetVerifiedAccountIdByEmailHandler(
      createRepository([
        {
          accountId: "account_1",
          address: "pending@example.com",
          createdAt: "2026-07-30T00:00:00.000Z",
          emailId: "email_1",
          isPrimary: false,
          isPublic: false,
          isVerified: false,
          ownership: "personal",
        },
      ]),
    );

    await expect(
      handler.getVerifiedAccountIdByEmail({
        email: "pending@example.com",
      }),
    ).resolves.toEqual({ status: "email-not-found" });
    await expect(
      handler.getVerifiedAccountIdByEmail({
        email: "missing@example.com",
      }),
    ).resolves.toEqual({ status: "email-not-found" });
  });
});
