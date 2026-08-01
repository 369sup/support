export interface EmailVerificationDeliveryGatewayPort {
  deliverVerification(input: {
    address: string;
    idempotencyKey: string;
    token: string;
  }): Promise<boolean>;
}
