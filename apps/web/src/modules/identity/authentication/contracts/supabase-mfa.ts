export type AuthenticatorAssuranceLevel = "aal1" | "aal2";

export type MfaFactorReference = Readonly<{
  createdAt: string;
  factorId: string;
  friendlyName: string | null;
  status: "unverified" | "verified";
  updatedAt: string;
}>;

export type MfaAssuranceResult =
  | Readonly<{
      currentLevel: AuthenticatorAssuranceLevel | null;
      nextLevel: AuthenticatorAssuranceLevel | null;
      status: "found";
    }>
  | Readonly<{ status: "service-unavailable" }>;

export type MfaFactorsResult =
  | Readonly<{
      factors: readonly MfaFactorReference[];
      status: "found";
    }>
  | Readonly<{ status: "service-unavailable" }>;

export type TotpEnrollmentResult =
  | Readonly<{
      factorId: string;
      friendlyName: string | null;
      qrCode: string;
      secret: string;
      status: "enrolled";
      uri: string;
    }>
  | Readonly<{ status: "invalid-factor" | "service-unavailable" }>;

export type MfaChallengeResult =
  | Readonly<{
      challengeId: string;
      expiresAt: number;
      status: "challenged";
    }>
  | Readonly<{ status: "invalid-factor" | "service-unavailable" }>;

export type MfaMutationResult =
  | Readonly<{ status: "updated" }>
  | Readonly<{
      status: "invalid-factor" | "invalid-verification" | "service-unavailable";
    }>;
