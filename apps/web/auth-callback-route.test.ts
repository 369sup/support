import { beforeEach, describe, expect, it, vi } from "vitest";

const doubles = vi.hoisted(() => ({
  completeExternalSignIn: vi.fn(),
  isSupabaseAuthenticationEnabled: vi.fn(),
  verifySupabaseOtp: vi.fn(),
}));

vi.mock("@/modules/identity/authentication/server-api", () => doubles);

import { GET } from "./src/app/(public)/auth/callback/route";

function callbackRequest(query: string): Request {
  return new Request(`https://support.example.com/auth/callback?${query}`);
}

describe("Supabase Auth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    doubles.isSupabaseAuthenticationEnabled.mockReturnValue(true);
  });

  it("forwards the current SDK flow ID and accepts an allowed destination", async () => {
    doubles.completeExternalSignIn.mockResolvedValue({
      status: "authenticated",
    });

    const response = await GET(
      callbackRequest(
        "code=oauth-code&sb_flow_id=flow-1&next=%2Fdashboard",
      ),
    );

    expect(doubles.completeExternalSignIn).toHaveBeenCalledWith({
      code: "oauth-code",
      flowId: "flow-1",
    });
    expect(response.headers.get("location")).toBe(
      "https://support.example.com/dashboard",
    );
  });

  it("does not redirect to an untrusted callback destination", async () => {
    doubles.completeExternalSignIn.mockResolvedValue({
      status: "authenticated",
    });

    const response = await GET(
      callbackRequest(
        "code=oauth-code&next=https%3A%2F%2Fevil.example%2Fsteal",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://support.example.com/login?confirmation=confirmed",
    );
  });

  it("sends a new verified Google identity to username onboarding", async () => {
    doubles.completeExternalSignIn.mockResolvedValue({
      email: "octocat@example.com",
      status: "onboarding-required",
    });

    const response = await GET(callbackRequest("code=oauth-code"));

    expect(response.headers.get("location")).toBe(
      "https://support.example.com/signup/complete",
    );
  });

  it("normalizes a cancelled provider callback without exchanging a code", async () => {
    const response = await GET(
      callbackRequest(
        "error=access_denied&error_description=The+user+cancelled",
      ),
    );

    expect(doubles.completeExternalSignIn).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://support.example.com/login?confirmation=invalid-confirmation",
    );
  });
});
