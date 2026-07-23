import { http, HttpResponse } from "msw";

import {
  mockAuthEndpoints,
  mockCredentials,
  mockSessionToken,
  mockSessionResponseSchema,
  mockSignInRequestSchema,
} from "./mock-auth-contract";

const mockSession = mockSessionResponseSchema.parse({
  session: {
    token: mockSessionToken,
    user: {
      id: "mock-user-octocat",
      username: mockCredentials.username,
      displayName: "The Octocat",
    },
  },
});

function hasValidMockSession(request: Request) {
  return request.headers.get("authorization") === `Bearer ${mockSessionToken}`;
}

export const mockApiHandlers = [
  http.post(`*${mockAuthEndpoints.signIn}`, async ({ request }) => {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return HttpResponse.json(
        { message: "Enter a username and password." },
        { status: 400 },
      );
    }

    const result = mockSignInRequestSchema.safeParse(body);

    if (!result.success) {
      return HttpResponse.json(
        { message: "Enter a username and password." },
        { status: 400 },
      );
    }

    if (
      result.data.username !== mockCredentials.username ||
      result.data.password !== mockCredentials.password
    ) {
      return HttpResponse.json(
        { message: "Incorrect mock username or password." },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockSession);
  }),
  http.get(`*${mockAuthEndpoints.session}`, ({ request }) => {
    if (!hasValidMockSession(request)) {
      return HttpResponse.json(
        { message: "Mock session is not authenticated." },
        { status: 401 },
      );
    }

    return HttpResponse.json(mockSession);
  }),
  http.post(`*${mockAuthEndpoints.signOut}`, ({ request }) => {
    if (!hasValidMockSession(request)) {
      return HttpResponse.json(
        { message: "Mock session is not authenticated." },
        { status: 401 },
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
