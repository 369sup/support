import { NextResponse } from "next/server";

import {
  completeExternalSignIn,
  isSupabaseAuthenticationEnabled,
  verifySupabaseOtp,
} from "@/modules/identity/authentication/server-api";

type ConfirmationType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

function isConfirmationType(value: string | null): value is ConfirmationType {
  return (
    value === "email" ||
    value === "email_change" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "signup"
  );
}

type ConfirmationResult = Readonly<{
  status: "confirmed" | "invalid-confirmation" | "service-unavailable";
}>;

async function confirmRequest(
  tokenHash: string | null,
  type: string | null,
): Promise<ConfirmationResult> {
  if (tokenHash !== null && isConfirmationType(type)) {
    return verifySupabaseOtp({ tokenHash, type });
  }
  return { status: "invalid-confirmation" };
}

const allowedPostAuthenticationPaths = new Set([
  "/dashboard",
  "/reset-password",
]);

function resolvePostAuthenticationPath(
  next: string | null,
  type: string | null,
): string {
  if (type === "recovery") {
    return "/reset-password";
  }
  return next !== null && allowedPostAuthenticationPaths.has(next)
    ? next
    : "/login?confirmation=confirmed";
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  if (!isSupabaseAuthenticationEnabled()) {
    return NextResponse.redirect(
      new URL("/login?confirmation=unavailable", requestUrl),
    );
  }
  const code = requestUrl.searchParams.get("code");
  if (code !== null) {
    const flowId = requestUrl.searchParams.get("sb_flow_id");
    const result = await completeExternalSignIn({
      code,
      ...(flowId === null ? {} : { flowId }),
    });
    if (result.status === "onboarding-required") {
      return NextResponse.redirect(
        new URL("/signup/complete", requestUrl),
      );
    }
    if (result.status === "authenticated") {
      return NextResponse.redirect(
        new URL(
          resolvePostAuthenticationPath(
            requestUrl.searchParams.get("next"),
            requestUrl.searchParams.get("type"),
          ),
          requestUrl,
        ),
      );
    }
    return NextResponse.redirect(
      new URL(
        `/login?confirmation=${
          result.status === "service-unavailable"
            ? "service-unavailable"
            : "invalid-confirmation"
        }`,
        requestUrl,
      ),
    );
  }
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const result = await confirmRequest(tokenHash, type);
  if (result.status !== "confirmed") {
    return NextResponse.redirect(
      new URL(`/login?confirmation=${result.status}`, requestUrl),
    );
  }
  return NextResponse.redirect(
    new URL(resolvePostAuthenticationPath(null, type), requestUrl),
  );
}
