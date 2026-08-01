export type EnrollTotpResult =
  | Readonly<{
      factorId: string;
      friendlyName: string | null;
      qrCode: string;
      secret: string;
      status: "enrolled";
      uri: string;
    }>
  | Readonly<{ status: "invalid-factor" | "service-unavailable" }>;

export interface EnrollTotpUseCase {
  enrollTotp(friendlyName?: string): Promise<EnrollTotpResult>;
}
