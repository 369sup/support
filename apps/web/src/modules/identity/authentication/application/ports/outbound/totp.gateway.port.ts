export type TotpEnrollment = Readonly<{
  provisioningUri: string;
  secret: string;
}>;

export type TotpValidation =
  | Readonly<{ status: "valid"; counter: number }>
  | Readonly<{ status: "invalid" }>;

export interface TotpGatewayPort {
  createEnrollment(label: string): TotpEnrollment;
  validate(secret: string, token: string): TotpValidation;
}
