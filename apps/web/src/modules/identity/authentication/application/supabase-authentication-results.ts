export type SupabaseTotpEnrollmentGatewayResult =
  | Readonly<{
      factorId: string;
      friendlyName: string | null;
      qrCode: string;
      secret: string;
      status: "enrolled";
      uri: string;
    }>
  | Readonly<{ status: "invalid-factor" | "service-unavailable" }>;

export type SupabaseMfaUpdateGatewayResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{
      status:
        | "invalid-factor"
        | "invalid-verification"
        | "service-unavailable";
    }>;

export type SupabaseEmailConfirmationType =
  | "email"
  | "email_change"
  | "invite"
  | "magiclink"
  | "recovery"
  | "signup";

export type SupabaseOtpVerificationGatewayResult =
  | Readonly<{ status: "confirmed" }>
  | Readonly<{
      status: "invalid-confirmation" | "service-unavailable";
    }>;
