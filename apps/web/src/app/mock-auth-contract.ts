import { z } from "zod";

export const mockAuthEndpoints = {
  session: "/api/mock-auth/session",
  signIn: "/api/mock-auth/sign-in",
  signOut: "/api/mock-auth/sign-out",
} as const;

export const mockAuthStorageKey = "support.mock-auth.token";

export const mockCredentials = {
  username: "octocat",
  password: "github",
} as const;

export const mockSessionToken = "support-development-session";

export const mockSessionResponseSchema = z.object({
  session: z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      username: z.string(),
      displayName: z.string(),
    }),
  }),
});

export const mockSignInRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const mockApiErrorSchema = z.object({ message: z.string() });

export type MockSessionResponse = z.infer<typeof mockSessionResponseSchema>;
