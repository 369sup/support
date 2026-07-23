import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import {
  mockAuthEndpoints,
  mockCredentials,
  mockSessionToken,
  mockSessionResponseSchema,
} from "./src/app/mock-auth-contract";
import { mockApiHandlers } from "./src/app/mock-api-handlers";

const server = setupServer(...mockApiHandlers);
const origin = "http://support.test";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("mock authentication API", () => {
  it("creates and resolves a mock session", async () => {
    const signInResponse = await fetch(`${origin}${mockAuthEndpoints.signIn}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mockCredentials),
    });
    const signInPayload: unknown = await signInResponse.json();
    const signInResult = mockSessionResponseSchema.parse(signInPayload);

    expect(signInResponse.status).toBe(200);
    expect(signInResult.session).toMatchObject({
      token: mockSessionToken,
      user: { username: mockCredentials.username },
    });

    const sessionResponse = await fetch(`${origin}${mockAuthEndpoints.session}`, {
      headers: { authorization: `Bearer ${signInResult.session.token}` },
    });

    expect(sessionResponse.status).toBe(200);
  });

  it("rejects incorrect credentials", async () => {
    const response = await fetch(`${origin}${mockAuthEndpoints.signIn}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "octocat", password: "incorrect" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "Incorrect mock username or password.",
    });
  });

  it("requires the mock bearer token for session and sign-out", async () => {
    const sessionResponse = await fetch(`${origin}${mockAuthEndpoints.session}`);
    const signOutResponse = await fetch(`${origin}${mockAuthEndpoints.signOut}`, {
      method: "POST",
      headers: { authorization: `Bearer ${mockSessionToken}` },
    });

    expect(sessionResponse.status).toBe(401);
    expect(signOutResponse.status).toBe(204);
  });
});
